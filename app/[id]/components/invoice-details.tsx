import { Calendar, MapPin } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface EventData {
  start_date: string;
  end_date?: string;
  location?: string;
}

interface UserData {
  name: string;
  email: string;
  image_url: string | null;
}

interface InvoiceDetailsProps {
  event?: EventData | null;
  user?: UserData | null;
}

export function InvoiceDetails({ event, user }: InvoiceDetailsProps) {
  return (
    <div className="flex-1 space-y-6">
      {event && (
        <div>
          <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-3">
            Event Details
          </h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-900">
                  {formatDate(event.start_date)}
                </p>
                {event.end_date && (
                  <p className="text-sm text-slate-500">
                    to {formatDate(event.end_date)}
                  </p>
                )}
              </div>
            </div>
            {event.location && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
                <p className="text-slate-700">{event.location}</p>
              </div>
            )}
          </div>
        </div>
      )}
      {user && (
        <div>
          <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-3">
            Customer
          </h2>
          <div className="flex items-center gap-3">
            {user.image_url ? (
              <img
                src={user.image_url}
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                <span className="text-slate-500 font-medium">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <p className="font-semibold text-slate-900">{user.name}</p>
              {user.email && (
                <p className="text-sm text-slate-500">{user.email}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
