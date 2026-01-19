import React, { useState } from "react";
import { Lead } from "@/types/crm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit, Save, X, Mail, Phone, Building2, Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TagInput } from "@/components/ui/tag-input";
import { TagCreatorDialog } from "@/components/ui/tag-creator-dialog";
import { useTags } from "@/hooks/useTags";

interface ProfileCardProps {
  lead: Lead;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  handleSaveEdit: () => void;
  agents: { id: string; name: string }[];
}

export function ProfileCard({ 
  lead, 
  isEditing, 
  setIsEditing, 
  handleSaveEdit,
  agents
}: ProfileCardProps) {
  const { tags, createTag } = useTags()
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>(lead.tags?.map(tag => tag.id) || [])

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Qualified':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Proposal':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Closed':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  const responsibleAgent = agents.find(a => a.id === lead.agentId)?.name || "Not assigned";

  const handleTagSelect = (tagId: string) => {
    setSelectedTags(prev => [...prev, tagId])
  }

  const handleTagRemove = (tagId: string) => {
    setSelectedTags(prev => prev.filter(id => id !== tagId))
  }

  const handleCreateTag = (name: string) => {
    setIsTagDialogOpen(true)
  }

  const handleConfirmCreateTag = async (name: string, color: string) => {
    const newTag = await createTag(name, color);
    if (newTag && newTag.id) {
      setSelectedTags(prev => [...prev, newTag.id]);
    }
  }

  return (
    <Card className="overflow-hidden border-green-100">
      <div className="bg-gradient-to-r from-green-50 to-green-100 py-6">
        <div className="flex flex-col items-center justify-center">
          <Avatar className="h-24 w-24 mb-4 border-4 border-white shadow-lg">
            <AvatarFallback className="bg-green-600 text-white text-xl">
              {getInitials(lead.name)}
            </AvatarFallback>
          </Avatar>
          
          <h2 className="text-2xl font-bold text-center">{lead.name}</h2>
          
          <div className="text-green-800 mb-2">{lead.company}</div>
          
          <Badge variant="outline" className={`${getStatusColor(lead.status)} px-3 py-1 text-sm font-medium`}>
            {lead.status}
          </Badge>
          
          <div className="flex items-center mt-4 space-x-2">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} variant="outline" size="sm" className="border-green-200 text-green-700 hover:bg-green-50">
                <Edit size={16} className="mr-2" /> Edit
              </Button>
            ) : (
              <>
                <Button onClick={() => setIsEditing(false)} variant="outline" size="sm" className="border-red-200 text-red-700 hover:bg-red-50">
                  <X size={16} className="mr-2" /> Cancel
                </Button>
                <Button onClick={handleSaveEdit} size="sm" className="bg-green-600 hover:bg-green-700">
                  <Save size={16} className="mr-2" /> Save
                </Button>
              </>
            )}
          </div>

          <div className="mt-4 w-full max-w-md px-4">
            <TagInput
              placeholder="Add tag..."
              tags={tags}
              selectedTags={selectedTags}
              onTagSelect={handleTagSelect}
              onTagRemove={handleTagRemove}
              onCreateTag={handleCreateTag}
            />
          </div>
        </div>
      </div>

      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="flex flex-col items-center p-4 rounded-lg bg-green-50 border border-green-100">
            <Mail className="h-6 w-6 text-green-600 mb-2" />
            <div className="text-sm font-medium text-center">Email</div>
            <div className="text-sm text-green-700 text-center break-all">{lead.email}</div>
          </div>
          
          <div className="flex flex-col items-center p-4 rounded-lg bg-green-50 border border-green-100">
            <Phone className="h-6 w-6 text-green-600 mb-2" />
            <div className="text-sm font-medium text-center">Phone</div>
            <div className="text-sm text-green-700 text-center">{lead.phone || "Not provided"}</div>
          </div>
          
          <div className="flex flex-col items-center p-4 rounded-lg bg-green-50 border border-green-100">
            <Building2 className="h-6 w-6 text-green-600 mb-2" />
            <div className="text-sm font-medium text-center">Company</div>
            <div className="text-sm text-green-700 text-center">{lead.company || "Not provided"}</div>
          </div>
          
          <div className="flex flex-col items-center p-4 rounded-lg bg-green-50 border border-green-100">
            <Briefcase className="h-6 w-6 text-green-600 mb-2" />
            <div className="text-sm font-medium text-center">Responsible</div>
            <div className="text-sm text-green-700 text-center">{responsibleAgent}</div>
          </div>
        </div>
      </CardContent>

      <TagCreatorDialog
        open={isTagDialogOpen}
        onOpenChange={setIsTagDialogOpen}
        onCreateTag={handleConfirmCreateTag}
      />
    </Card>
  );
}
