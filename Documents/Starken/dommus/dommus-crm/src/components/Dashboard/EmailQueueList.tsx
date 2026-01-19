import React, { useEffect, useState } from "react";
import { Mail } from "lucide-react";

// Função simples para formatar datas
const formatSimpleDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  } catch (e) {
    return dateString;
  }
};

interface Email {
  id: string;
  subject: string;
  to: string;
  status: "pending" | "sent" | "failed";
  created_at: string;
  send_at: string;
}

interface EmailQueueListProps {
  className?: string;
  emails?: Email[];
}

export function EmailQueueList({ className, emails: initialEmails }: EmailQueueListProps) {
  const [emails, setEmails] = useState<Email[]>(initialEmails || []);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPendingEmails = async () => {
    try {
      setIsLoading(true);
      // Se tivermos acesso ao Supabase, buscaríamos os emails aqui
      // Como estamos simplificando, vamos apenas simular um delay
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error("Error fetching pending emails:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!initialEmails || initialEmails.length === 0) {
      fetchPendingEmails();
    } else {
      setEmails(initialEmails);
      setIsLoading(false);
    }
  }, [initialEmails]);

  return (
    <div className={`bg-background border rounded-lg shadow ${className || ""}`}>
      <div className="px-6 py-4 border-b">
        <h3 className="text-lg font-medium">Email Queue</h3>
      </div>
      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-24">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : emails.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-muted p-3 mb-2">
              <Mail className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-1">No emails in queue</p>
            <p className="text-sm text-muted-foreground/70">
              Scheduled emails will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {emails.map((email) => (
              <div
                key={email.id}
                className="flex items-center p-2 rounded-lg hover:bg-muted/50"
              >
                <div className="mr-4 flex-shrink-0 rounded-md bg-primary/10 p-2">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium text-sm">{email.subject}</p>
                  <p className="truncate text-sm text-muted-foreground">{email.to}</p>
                </div>
                <div className="text-right text-sm">
                  <p className="font-medium">
                    {formatSimpleDate(email.send_at)}
                  </p>
                  <p className="text-muted-foreground">
                    {new Date(email.send_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 