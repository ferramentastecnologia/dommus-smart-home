import { useNavigate } from "react-router-dom";
import { Lead } from "@/types/crm";

export function useLeadNavigation(lead: Lead | null) {
  const navigate = useNavigate();
  
  // Function to expand to full page
  const handleExpandToFullPage = () => {
    if (!lead) return;
    
    console.log("Expanding lead to full page:", lead);
    console.log("Lead ID to navigate to:", lead.id);
    
    // Navigate to the full page with the lead ID
    navigate(`/leads/${lead.id}`);
  };
  
  return {
    handleExpandToFullPage
  };
}
