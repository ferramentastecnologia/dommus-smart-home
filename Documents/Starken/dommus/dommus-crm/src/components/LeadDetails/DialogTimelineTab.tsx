import React from "react";
import { Lead } from "@/types/crm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";

interface DialogTimelineTabProps {
  lead: Lead;
}

export function DialogTimelineTab({ lead }: DialogTimelineTabProps) {
  // Function to format date
  const formatDate = (date: Date) => {
    return format(date, "MMM d, yyyy 'at' h:mm a", { locale: enUS });
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {lead.history?.length === 0 ? (
            <p className="text-muted-foreground text-sm">No activity found.</p>
          ) : (
            <div className="relative border-l-2 border-green-200 pl-4 ml-4 space-y-6">
              {lead.history?.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((event, index) => (
                  <div key={event.id || index} className="relative">
                    <div className="absolute -left-6 mt-1.5 h-3 w-3 rounded-full bg-green-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(new Date(event.date))}
                      </p>
                      <p className="text-sm font-medium mt-1">{event.action}</p>
                      <p className="text-sm mt-1">{event.description}</p>
                    </div>
                  </div>
                ))
              }
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
