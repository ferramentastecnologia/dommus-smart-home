import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { CalendarClock, Edit, Mail, MessageSquare, User, UserPlus } from 'lucide-react';
import { getLeadTimeline } from '@/services/supabase/leads';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/services/supabase/client';
import { useLeadStatuses } from '@/hooks/useLeadStatuses';
import { useLeadSources } from '@/hooks/useLeadSources';

interface TimelineEvent {
  id: string;
  lead_id: string;
  event_type: string;
  event_data: any;
  created_at: string;
  created_by?: string;
}

interface LeadTimelineProps {
  leadId: string;
}

const eventIcons: Record<string, React.ReactNode> = {
  status_change: <Edit className="h-4 w-4 text-blue-500" />,
  note_added: <MessageSquare className="h-4 w-4 text-yellow-500" />,
  task_created: <CalendarClock className="h-4 w-4 text-violet-500" />,
  task_completed: <CalendarClock className="h-4 w-4 text-green-500" />,
  task_status_change: <CalendarClock className="h-4 w-4 text-blue-500" />,
  email_sent: <Mail className="h-4 w-4 text-blue-500" />,
  source_change: <Edit className="h-4 w-4 text-orange-500" />,
  agent_assigned: <User className="h-4 w-4 text-indigo-500" />,
  details_updated: <Edit className="h-4 w-4 text-gray-500" />,
  // Backward compatibility
  lead_created: <UserPlus className="h-4 w-4 text-green-500" />,
  lead_updated: <Edit className="h-4 w-4 text-blue-500" />,
  lead_converted: <User className="h-4 w-4 text-green-500" />,
  lead_discarded: <User className="h-4 w-4 text-destructive" />,
  task_canceled: <CalendarClock className="h-4 w-4 text-destructive" />,
};

const eventLabels: Record<string, string> = {
  status_change: "Status changed",
  note_added: "Note added",
  task_created: "Task created",
  task_completed: "Task completed",
  task_status_change: "Task status changed",
  email_sent: "Email sent",
  source_change: "Source changed",
  agent_assigned: "Agent assigned",
  details_updated: "Details updated",
  // Backward compatibility
  lead_created: "Lead created",
  lead_updated: "Lead updated",
  lead_converted: "Lead converted",
  lead_discarded: "Lead discarded",
  task_canceled: "Task canceled",
};

export const LeadTimeline: React.FC<LeadTimelineProps> = ({ leadId }) => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [agentNames, setAgentNames] = useState<Record<string, string>>({});
  const [statusNames, setStatusNames] = useState<Record<string, string>>({});
  const [sourceNames, setSourceNames] = useState<Record<string, string>>({});
  const { getStatusById } = useLeadStatuses();
  const { getSourceById } = useLeadSources();

  // Fetch reference data (agents, statuses, sources)
  useEffect(() => {
    const fetchReferenceData = async () => {
      try {
        // Fetch agents
        const { data: agentsData } = await supabase
          .from('agents')
          .select('id, name');
        
        if (agentsData) {
          const agentMap: Record<string, string> = {};
          agentsData.forEach(agent => {
            agentMap[agent.id] = agent.name;
          });
          setAgentNames(agentMap);
        }

        // Fetch statuses
        const { data: statusesData } = await supabase
          .from('lead_statuses')
          .select('id, name');
        
        if (statusesData) {
          const statusMap: Record<string, string> = {};
          statusesData.forEach(status => {
            statusMap[status.id] = status.name;
          });
          setStatusNames(statusMap);
        }

        // Fetch sources
        const { data: sourcesData } = await supabase
          .from('lead_sources')
          .select('id, name');
        
        if (sourcesData) {
          const sourceMap: Record<string, string> = {};
          sourcesData.forEach(source => {
            sourceMap[source.id] = source.name;
          });
          setSourceNames(sourceMap);
        }
      } catch (err) {
        console.error("Error fetching reference data:", err);
      }
    };

    fetchReferenceData();
  }, []);

  useEffect(() => {
    const fetchTimeline = async () => {
      if (!leadId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        console.log("Fetching timeline for lead:", leadId);
        const timeline = await getLeadTimeline(leadId);
        console.log("Timeline data received:", timeline);
        setEvents(timeline || []);
      } catch (error) {
        console.error("Error fetching timeline:", error);
        setError(error as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimeline();
  }, [leadId]);

  const formatTimestamp = (timestamp: string) => {
    try {
      return format(new Date(timestamp), "MMM d, yyyy 'at' h:mm a", { locale: enUS });
    } catch (e) {
      console.error("Error formatting timestamp:", timestamp, e);
      return "Invalid date";
    }
  };

  const getEventActor = (event: TimelineEvent) => {
    if (event.created_by) {
      if (agentNames[event.created_by]) {
        return agentNames[event.created_by];
      }
      return "User";
    }
    return "System";
  };

  // Function to get status name from ID
  const getStatusName = (statusId: string) => {
    if (statusNames[statusId]) {
      return statusNames[statusId];
    }
    
    // Try to get from the hook
    const status = getStatusById ? getStatusById(statusId) : null;
    if (status && status.name) {
      return status.name;
    }
    
    return statusId.substring(0, 8) + "...";
  };

  // Function to get source name from ID
  const getSourceName = (sourceId: string) => {
    if (sourceNames[sourceId]) {
      return sourceNames[sourceId];
    }
    
    // Try to get from the hook
    const source = getSourceById ? getSourceById(sourceId) : null;
    if (source && source.name) {
      return source.name;
    }
    
    return sourceId.substring(0, 8) + "...";
  };

  // Function to get agent name from ID
  const getAgentName = (agentId: string) => {
    if (agentNames[agentId]) {
      return agentNames[agentId];
    }
    return agentId.substring(0, 8) + "...";
  };

  const renderEventDetails = (event: TimelineEvent) => {
    const actor = getEventActor(event);
    
    // Parse event_data if it's a string
    let data = event.event_data;
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) {
        console.error("Error parsing event_data:", e);
        data = {};
      }
    }
    
    // If data is still null or undefined, use an empty object
    data = data || {};
    
    switch (event.event_type) {
      case 'status_change':
        return (
          <div>
            <p><span className="font-medium">{actor}</span> changed status</p>
            {(data.old_status_id || data.new_status_id) && (
              <p className="text-xs text-muted-foreground mt-1">
                {data.old_status_id && <span>From: {getStatusName(data.old_status_id)}</span>}
                {data.old_status_id && data.new_status_id && <span> → </span>}
                {data.new_status_id && <span>To: {getStatusName(data.new_status_id)}</span>}
              </p>
            )}
          </div>
        );
        
      case 'note_added':
        return (
          <div>
            <p><span className="font-medium">{actor}</span> added a note</p>
            {data.content && (
              <p className="text-xs italic mt-1 line-clamp-2">"{data.content}"</p>
            )}
          </div>
        );
        
      case 'task_created':
        return (
          <div>
            <p><span className="font-medium">{actor}</span> created a task</p>
            {data.title && (
              <p className="text-xs italic mt-1 line-clamp-2">"{data.title}"</p>
            )}
            {data.due_date && (
              <p className="text-xs text-muted-foreground mt-1">
                Due: {format(new Date(data.due_date), "MMM d, yyyy", { locale: enUS })}
              </p>
            )}
          </div>
        );
        
      case 'task_completed':
        return (
          <div>
            <p><span className="font-medium">{actor}</span> completed a task</p>
            {data.title && (
              <p className="text-xs italic mt-1 line-clamp-2">"{data.title}"</p>
            )}
          </div>
        );
        
      case 'task_status_change':
        return (
          <div>
            <p><span className="font-medium">{actor}</span> changed task status</p>
            {data.title && (
              <p className="text-xs italic mt-1 line-clamp-2">"{data.title}"</p>
            )}
          </div>
        );
        
      case 'email_sent':
        return (
          <div>
            <p><span className="font-medium">{actor}</span> sent an email</p>
            {data.subject && (
              <p className="text-xs italic mt-1 line-clamp-2">Subject: "{data.subject}"</p>
            )}
          </div>
        );
        
      case 'source_change':
        return (
          <div>
            <p><span className="font-medium">{actor}</span> changed the lead source</p>
            {(data.old_source_id || data.new_source_id) && (
              <p className="text-xs text-muted-foreground mt-1">
                {data.old_source_id && <span>From: {getSourceName(data.old_source_id)}</span>}
                {data.old_source_id && data.new_source_id && <span> → </span>}
                {data.new_source_id && <span>To: {getSourceName(data.new_source_id)}</span>}
              </p>
            )}
          </div>
        );
        
      case 'agent_assigned':
        return (
          <div>
            <p><span className="font-medium">{actor}</span> changed lead assignment</p>
            {(data.old_assigned_to || data.new_assigned_to) && (
              <p className="text-xs text-muted-foreground mt-1">
                {data.old_assigned_to === null ? 
                  <span>From: Not assigned</span> :
                  data.old_assigned_to && <span>From: {getAgentName(data.old_assigned_to)}</span>
                }
                {data.old_assigned_to !== undefined && data.new_assigned_to !== undefined && <span> → </span>}
                {data.new_assigned_to === null ? 
                  <span>To: Not assigned</span> :
                  data.new_assigned_to && <span>To: {getAgentName(data.new_assigned_to)}</span>
                }
              </p>
            )}
          </div>
        );
        
      case 'details_updated':
        return (
          <div>
            <p><span className="font-medium">{actor}</span> updated lead details</p>
            {data.fields && (
              <p className="text-xs text-muted-foreground mt-1">
                Fields updated: {Object.keys(data.fields).join(', ')}
              </p>
            )}
          </div>
        );
        
      // Backward compatibility
      case 'lead_created':
        return <p><span className="font-medium">{actor}</span> created this lead</p>;
        
      case 'lead_updated':
        return (
          <div>
            <p><span className="font-medium">{actor}</span> updated the lead</p>
            {data.fields && (
              <p className="text-xs text-muted-foreground mt-1">
                Fields updated: {Object.keys(data.fields).join(', ')}
              </p>
            )}
          </div>
        );
        
      case 'lead_converted':
        return <p><span className="font-medium">{actor}</span> converted this lead to a customer</p>;
        
      case 'lead_discarded':
        return <p><span className="font-medium">{actor}</span> discarded this lead</p>;
        
      case 'task_canceled':
        return (
          <div>
            <p><span className="font-medium">{actor}</span> canceled a task</p>
            {data.title && (
              <p className="text-xs italic mt-1 line-clamp-2">"{data.title}"</p>
            )}
          </div>
        );
        
      default:
        return <p>{eventLabels[event.event_type] || event.event_type}</p>;
    }
  };

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-destructive">Failed to load timeline</p>
        <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
        <p className="text-xs text-muted-foreground mt-1">Please try refreshing the page</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4 py-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-2 w-full">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!events || events.length === 0) {
    return <div className="py-10 text-center text-muted-foreground">No timeline events found</div>;
  }

  return (
    <div className="space-y-4">
      {events.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ).map((event) => (
        <div key={event.id} className="border-l-2 pl-4 pb-4 -ml-1 border-muted-foreground/30">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-muted p-1 -ml-6 border border-background">
              {eventIcons[event.event_type] || <Edit className="h-4 w-4" />}
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                {formatTimestamp(event.created_at)}
              </p>
              <div className="text-sm">
                {renderEventDetails(event)}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}; 