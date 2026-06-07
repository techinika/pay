import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase-admin";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const INVOICE_SELECT = `
  id,
  registration_id,
  amount,
  currency,
  status,
  payment_link,
  created_at,
  registration:event_registrations(
    id,
    event_id,
    user_id,
    ticket_id,
    status,
    answers,
    created_at,
    event:events(
      id,
      title,
      full_description,
      start_date,
      end_date,
      location
    ),
    ticket:event_tickets(
      id,
      currency
    )
  )
`;

interface FlatRegistration {
  event: Record<string, unknown> | null;
  ticket: Record<string, unknown> | null;
  user_id?: string;
}

interface FlatInvoice {
  id: string;
  registration_id: string;
  amount: number;
  currency: string;
  status: string;
  payment_link: string | null;
  created_at: string;
  registration: Record<string, unknown> | null;
}

function formatInvoiceData(data: FlatInvoice): SearchResult {
  const registration = data.registration as FlatRegistration | null;
  const rawEvent = registration?.event as Record<string, unknown> | null;
  const ticket = registration?.ticket as Record<string, unknown> | null;
  const currency = (ticket?.currency as string) || data.currency;

  return {
    id: data.id,
    registration_id: data.registration_id,
    amount: Number(data.amount),
    currency,
    status: data.status,
    payment_link: data.payment_link,
    created_at: data.created_at,
    event: rawEvent
      ? {
          id: rawEvent.id as string,
          title: rawEvent.title as string,
          description: rawEvent.full_description as string,
          start_date: rawEvent.start_date as string,
          end_date: rawEvent.end_date as string,
          location: rawEvent.location as string,
        }
      : undefined,
    user: null,
  };
}

export interface SearchResult {
  id: string;
  registration_id: string;
  amount: number;
  currency: string;
  status: string;
  payment_link: string | null;
  created_at: string;
  event?: {
    id: string;
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    location: string;
  };
  user: {
    name: string;
    email: string;
    image_url: string | null;
    username: string | null;
  } | null;
}

export async function searchInvoices(query: string): Promise<SearchResult[]> {
  const isUuid = UUID_REGEX.test(query);
  let invoices: SearchResult[] = [];

  if (isUuid) {
    const { data: invoiceData, error: invoiceError } = await supabase
      .from("event_invoices")
      .select(INVOICE_SELECT)
      .eq("id", query)
      .single();

    if (invoiceError && invoiceError.code !== "PGRST116") {
      throw invoiceError;
    }

    if (invoiceData) {
      invoices = [formatInvoiceData(invoiceData as unknown as FlatInvoice)];
    }

    if (invoices.length === 0) {
      const { data: regData } = await supabase
        .from("event_registrations")
        .select("id")
        .eq("id", query)
        .single();

      if (regData) {
        const { data: invData, error: invError } = await supabase
          .from("event_invoices")
          .select(INVOICE_SELECT)
          .eq("registration_id", query)
          .order("created_at", { ascending: false });

        if (!invError && invData) {
          invoices = (invData as unknown as FlatInvoice[]).map(formatInvoiceData);
        }
      }
    }
  } else {
    const registrationIds: string[] = [];
    let authorData: { id: string; name: string; image_url: string | null; username: string | null }[] | undefined;

    const { data: authorResult, error: authorError } = await supabase
      .from("authors")
      .select("id, name, image_url, username")
      .ilike("name", `%${query}%`);

    if (!authorError && authorResult && authorResult.length > 0) {
      authorData = authorResult;
      const authorIds = authorResult.map((a) => a.id);

      const { data: regData } = await supabase
        .from("event_registrations")
        .select("id")
        .in("user_id", authorIds);

      if (regData) {
        registrationIds.push(...regData.map((r) => r.id));
      }
    }

    if (registrationIds.length === 0) {
      let matchingUsers: { id: string; email?: string | null }[] | undefined;

      try {
        const { data: authUserData } =
          await supabaseAdmin.auth.admin.listUsers();
        matchingUsers = authUserData?.users.filter((u) =>
          u.email?.toLowerCase().includes(query.toLowerCase()),
        );
      } catch {
        // skip auth user search when SUPABASE_SERVICE_KEY is not configured
      }

      if (matchingUsers && matchingUsers.length > 0) {
        const userIds = matchingUsers.map((u) => u.id);

        const { data: regData } = await supabase
          .from("event_registrations")
          .select("id")
          .in("user_id", userIds);

        if (regData) {
          registrationIds.push(...regData.map((r) => r.id));
        }
      }
    }

    if (registrationIds.length > 0) {
      const uniqueRegIds = [...new Set(registrationIds)];

      const { data: invoiceData, error: invoiceError } = await supabase
        .from("event_invoices")
        .select(INVOICE_SELECT)
        .in("registration_id", uniqueRegIds)
        .order("created_at", { ascending: false });

      if (!invoiceError && invoiceData) {
        const authorMap = new Map(
          authorData?.map((a) => [a.id, a]) || [],
        );

        invoices = (invoiceData as unknown as FlatInvoice[]).map((inv) => {
          const formatted = formatInvoiceData(inv);
          const reg = inv.registration as FlatRegistration | null;
          const userId = reg?.user_id;
          if (userId && authorMap.has(userId)) {
            const author = authorMap.get(userId)!;
            formatted.user = {
              name: author.name,
              email: "",
              image_url: author.image_url,
              username: author.username,
            };
          }
          return formatted;
        });
      }
    }
  }

  return invoices;
}
