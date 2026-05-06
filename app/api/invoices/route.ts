import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.trim();

    if (!query) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 },
      );
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(query);

    let invoices: Record<string, unknown>[] = [];

    if (isUuid) {
      const { data: invoiceData, error: invoiceError } = await supabase
        .from("event_invoices")
        .select(
          `
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
        `)
        .eq("id", query)
        .single();

      if (invoiceError && invoiceError.code !== "PGRST116") {
        throw invoiceError;
      }

      if (invoiceData) {
        invoices = [formatInvoiceData(invoiceData)];
      }

      if (invoices.length === 0) {
        const { data: regData, error: regError } = await supabase
          .from("event_registrations")
          .select("id")
          .eq("id", query)
          .single();

        if (!regError && regData) {
          const { data: invData, error: invError } = await supabase
            .from("event_invoices")
            .select(`
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
            `)
            .eq("registration_id", query)
            .order("created_at", { ascending: false });

          if (!invError && invData) {
            invoices = invData.map(formatInvoiceData);
          }
        }
      }
    } else {
      const registrationIds: string[] = [];

      const { data: authorData, error: authorError } = await supabase
        .from("authors")
        .select("id")
        .ilike("name", `%${query}%`);

      if (!authorError && authorData && authorData.length > 0) {
        const authorIds = authorData.map((a) => a.id);

        const { data: regData } = await supabase
          .from("event_registrations")
          .select("id")
          .in("user_id", authorIds);

        if (regData) {
          registrationIds.push(...regData.map((r) => r.id));
        }
      }

      if (registrationIds.length === 0) {
        const { data: authUserData } = await supabase.auth.admin.listUsers();

        const matchingUsers = authUserData?.users.filter(
          (u) => u.email?.toLowerCase().includes(query.toLowerCase())
        );

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
          .select(`
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
          `)
          .in("registration_id", uniqueRegIds)
          .order("created_at", { ascending: false });

        if (!invoiceError && invoiceData) {
          const authorDataMap = new Map<string, { name: string; image_url: string | null; username: string | null }>();
          
          if (authorData) {
            for (const author of authorData) {
              const { data: authorDetails } = await supabase
                .from("authors")
                .select("name, image_url, username")
                .eq("id", author.id)
                .single();
              if (authorDetails) {
                authorDataMap.set(author.id, authorDetails);
              }
            }
          }

          invoices = invoiceData.map((inv: Record<string, unknown>) => {
            const formatted = formatInvoiceData(inv);
            const reg = inv.registration as unknown as Record<string, unknown> | null;
            const userId = reg?.user_id as string | null;
            if (userId && authorDataMap.has(userId)) {
              const author = authorDataMap.get(userId)!;
              formatted.user = {
                id: userId,
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

    return NextResponse.json({ invoices });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Failed to search invoices" },
      { status: 500 },
    );
  }
}

function formatInvoiceData(
  data: Record<string, unknown>,
): Record<string, unknown> {
  const registration = data.registration as unknown as Record<string, unknown> | null;
  const event = registration?.event as unknown as Record<string, unknown> | null;
  const ticket = registration?.ticket as unknown as Record<string, unknown> | null;

  const currency = ticket?.currency as string | null;

  return {
    id: data.id,
    registration_id: data.registration_id,
    amount: Number(data.amount),
    currency: currency || data.currency,
    status: data.status,
    payment_link: data.payment_link,
    created_at: data.created_at,
    event: event
      ? {
          id: event.id,
          title: event.title,
          description: event.full_description,
          start_date: event.start_date,
          end_date: event.end_date,
          location: event.location,
        }
      : undefined,
  };
}