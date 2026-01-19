
import React from "react";
import { Lead } from "@/types/crm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TimelineTabProps {
  lead: Lead;
}

export function TimelineTab({ lead }: TimelineTabProps) {
  // Função para formatar data
  const formatDate = (date: Date) => {
    return format(date, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });
  };
  
  // Função para obter iniciais
  const getInitials = (name: string) => {
    return name.split(' ').map(part => part[0]).join('').toUpperCase();
  };
  
  return (
    <Card className="border-green-100">
      <CardHeader className="pb-2 border-b border-green-100">
        <CardTitle className="text-xl flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-green-600">
            <path d="M12 2v6"/>
            <polyline points="19 5 12 12 5 5"/>
            <path d="M19 12v1"/>
            <path d="M5 12v6"/>
            <path d="M19 18v-5"/>
          </svg>
          Timeline
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4">
          {lead.history?.length === 0 ? (
            <p className="text-muted-foreground">Nenhuma atividade encontrada.</p>
          ) : (
            <div className="relative border-l-2 border-green-200 pl-6 ml-6 space-y-8">
              {lead.history?.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((event, index) => (
                  <div key={event.id || index} className="relative">
                    <div className="absolute -left-8 mt-1.5">
                      <Avatar className="h-6 w-6 border-2 border-white">
                        <AvatarFallback className="bg-green-600 text-white text-xs">
                          {getInitials(event.action)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="bg-green-50 border border-green-100 p-4 rounded-md">
                      <p className="text-sm text-green-700 font-medium">
                        {formatDate(new Date(event.date))}
                      </p>
                      <p className="text-base font-medium mt-1">{event.action}</p>
                      <p className="mt-1 text-green-900">{event.description}</p>
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
