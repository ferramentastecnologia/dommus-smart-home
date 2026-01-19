import React from "react";
import { Mail } from "lucide-react";

const SimpleEmailQueueList = () => {
  return (
    <div className="bg-background border rounded-lg shadow">
      <div className="px-6 py-4 border-b">
        <h3 className="text-lg font-medium">Email Queue</h3>
      </div>
      <div className="p-6">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="rounded-full bg-muted p-3 mb-2">
            <Mail className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground mb-1">No emails in queue</p>
          <p className="text-sm text-muted-foreground/70">
            Scheduled emails will appear here
          </p>
        </div>
      </div>
    </div>
  );
};

export default SimpleEmailQueueList; 