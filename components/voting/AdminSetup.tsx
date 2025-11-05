import React, { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/select";
import Modal from "@/components/ui/Modal";
import { VotingRole, Meeting } from "@/types/voting";

interface AdminSetupProps {
  onMeetingCreated: (meeting: Meeting, url: string) => void;
  existingMeeting?: Meeting | null;
}

const AdminSetup: React.FC<AdminSetupProps> = ({ onMeetingCreated, existingMeeting }) => {
  const [meetingName, setMeetingName] = useState("");
  const [meetingDate, setMeetingDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  });
  const [clubName, setClubName] = useState("");
  const [createdBy, setCreatedBy] = useState("");
  const [roles, setRoles] = useState<VotingRole[]>([]);
  const [showAddRole, setShowAddRole] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load existing meeting data for editing
  useEffect(() => {
    if (existingMeeting) {
      setMeetingName(existingMeeting.name);
      setMeetingDate(existingMeeting.date);
      setClubName(existingMeeting.clubName || "");
      setCreatedBy(existingMeeting.createdBy || "");
      setRoles(existingMeeting.roles);
    }
  }, [existingMeeting]);
  
  const [newRoleName, setNewRoleName] = useState("");
  const [nominees, setNominees] = useState<string[]>([""]);

  const defaultRoles = [
    "Best Speaker",
    "Best Table Topics", 
    "Best Evaluator",
    "Most Helpful Role Player",
    "Most Encouraging Member"
  ];

  const addDefaultRoles = () => {
    const newRoles = defaultRoles.map((roleName, index) => ({
      id: `role-${Date.now()}-${index}`,
      name: roleName,
      nominees: [
        { name: "", prefix: "TM" as const }, 
        { name: "", prefix: "TM" as const }
      ] // Start with 2 empty nominee fields
    }));
    setRoles(newRoles);
  };

  const addCustomRole = () => {
    if (!newRoleName.trim()) return;
    
    const validNominees = nominees.filter(n => n.trim() !== "").map(name => ({
      name,
      prefix: "TM" as const
    }));
    if (validNominees.length === 0) return;

    const newRole: VotingRole = {
      id: `role-${Date.now()}`,
      name: newRoleName,
      nominees: validNominees
    };
    
    setRoles([...roles, newRole]);
    setNewRoleName("");
    setNominees([""]);
    setShowAddRole(false);
  };

  const updateRoleNominee = (roleId: string, nomineeIndex: number, value: string) => {
    setRoles(roles.map(role => 
      role.id === roleId 
        ? {
            ...role, 
            nominees: role.nominees.map((nominee, index) => 
              index === nomineeIndex ? { ...nominee, name: value } : nominee
            )
          }
        : role
    ));
  };

  const updateRoleNomineePrefix = (roleId: string, nomineeIndex: number, prefix: "TM" | "Guest") => {
    setRoles(roles.map(role => 
      role.id === roleId 
        ? {
            ...role, 
            nominees: role.nominees.map((nominee, index) => 
              index === nomineeIndex ? { ...nominee, prefix } : nominee
            )
          }
        : role
    ));
  };

  const addNomineeToRole = (roleId: string) => {
    setRoles(roles.map(role => 
      role.id === roleId 
        ? { ...role, nominees: [...role.nominees, { name: "", prefix: "TM" as const }] }
        : role
    ));
  };

  const removeNomineeFromRole = (roleId: string, nomineeIndex: number) => {
    setRoles(roles.map(role => 
      role.id === roleId 
        ? { 
            ...role, 
            nominees: role.nominees.filter((_, index) => index !== nomineeIndex)
          }
        : role
    ));
  };

  const addNomineeField = () => {
    setNominees([...nominees, ""]);
  };

  const updateNominee = (index: number, value: string) => {
    const updated = [...nominees];
    updated[index] = value;
    setNominees(updated);
  };

  const removeNominee = (index: number) => {
    if (nominees.length > 1) {
      setNominees(nominees.filter((_, i) => i !== index));
    }
  };

  const removeRole = (roleId: string) => {
    setRoles(roles.filter(role => role.id !== roleId));
  };

  const createMeeting = async () => {
    if (!meetingName.trim() || !meetingDate || !clubName.trim() || !createdBy.trim() || roles.length === 0) {
      alert("Please fill in all required fields and add at least one role.");
      return;
    }
    
    // Filter out empty nominees and check if all roles have at least one nominee
    const processedRoles = roles.map(role => ({
      ...role,
      nominees: role.nominees.filter(n => n.name.trim() !== "")
    }));
    
    const rolesWithoutNominees = processedRoles.filter(role => role.nominees.length === 0);
    if (rolesWithoutNominees.length > 0) {
      alert(`Please add nominees to: ${rolesWithoutNominees.map(r => r.name).join(", ")}`);
      return;
    }

    setIsSubmitting(true);

    try {
      if (existingMeeting?.slug) {
        // Update existing meeting
        const response = await fetch('/api/meetings/update', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            slug: existingMeeting.slug,
            name: meetingName,
            date: meetingDate,
            clubName,
            roles: processedRoles,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to update meeting');
        }

        const { meeting } = await response.json();
        const meetingUrl = `${window.location.origin}/voting/${existingMeeting.slug}`;
        onMeetingCreated(meeting, meetingUrl);
      } else {
        // Create new meeting
        const response = await fetch('/api/meetings/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: meetingName,
            date: meetingDate,
            clubName,
            createdBy,
            roles: processedRoles,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create meeting');
        }

        const { meeting, url } = await response.json();
        
        // Reset form only for new meetings
        setMeetingName("");
        setClubName("");
        setCreatedBy("");
        setRoles([]);
        setNewRoleName("");
        setNominees([""]);

        onMeetingCreated(meeting, url);
      }
    } catch (error) {
      console.error('Error saving meeting:', error);
      alert('Failed to save meeting. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <h2 className="text-xl font-semibold mb-4">
          {existingMeeting ? "Edit Voting Session" : "Create Voting Session"}
        </h2>
        
        {existingMeeting && (
          <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-start">
              <div className="text-orange-600 mr-3 mt-0.5">⚠️</div>
              <div className="text-sm text-orange-800">
                <p className="font-medium mb-1">Editing Active Session</p>
                <p>You are editing an active voting session. Changes will affect ongoing voting and results.</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Input
            label="Meeting Name"
            value={meetingName}
            onChange={setMeetingName}
            placeholder="e.g., Weekly Meeting - Dec 2024"
            required
          />
          <Input
            label="Meeting Date"
            type="date"
            value={meetingDate}
            onChange={setMeetingDate}
            required
          />
          <Input
            label="Club Name"
            value={clubName}
            onChange={setClubName}
            placeholder="e.g., Downtown Toastmasters"
            required
          />
          <Input
            label="Your Name/Email"
            value={createdBy}
            onChange={setCreatedBy}
            placeholder="e.g., admin@club.com"
            required
          />
        </div>

        <div className="flex gap-3 mb-6">
          <Button onClick={addDefaultRoles} variant="secondary">
            Add Default Roles
          </Button>
          <Button onClick={() => setShowAddRole(true)} variant="ghost">
            + Add Custom Role
          </Button>
        </div>
      </Card>

      {roles.length > 0 && (
        <Card>
          <h3 className="text-lg font-medium mb-4">Voting Categories ({roles.length})</h3>
          <div className="space-y-6">
            {roles.map((role) => (
              <div key={role.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-lg">{role.name}</h4>
                  <Button 
                    onClick={() => removeRole(role.id)} 
                    variant="danger" 
                    size="sm"
                  >
                    Remove Role
                  </Button>
                </div>
                
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Nominees
                  </label>
                  
                  <div className="space-y-2">
                    {role.nominees.map((nominee, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <Select
                          value={nominee.prefix}
                          onChange={(prefix) => updateRoleNomineePrefix(role.id, index, prefix as "TM" | "Guest")}
                          options={[
                            { value: "TM", label: "TM" },
                            { value: "Guest", label: "Guest" }
                          ]}
                          className="w-24 flex-shrink-0"
                        />
                        <Input
                          value={nominee.name}
                          onChange={(value) => updateRoleNominee(role.id, index, value)}
                          placeholder={`Nominee ${index + 1}`}
                          className="flex-1"
                        />
                        {role.nominees.length > 2 && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => removeNomineeFromRole(role.id, index)}
                          >
                            ×
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => addNomineeToRole(role.id)}
                    className="mt-2"
                  >
                    + Add Another Nominee
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-6 border-t">
            <Button 
              onClick={createMeeting}
              disabled={!meetingName || !meetingDate || !clubName || !createdBy || roles.length === 0 || isSubmitting}
              className="w-full"
            >
              {isSubmitting 
                ? "Saving..." 
                : existingMeeting 
                  ? "Update Voting Session" 
                  : "Create Voting Session"}
            </Button>
          </div>
        </Card>
      )}

      <Modal
        isOpen={showAddRole}
        onClose={() => setShowAddRole(false)}
        title="Add Custom Role"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowAddRole(false)}>
              Cancel
            </Button>
            <Button onClick={addCustomRole}>
              Add Role
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Role Name"
            value={newRoleName}
            onChange={setNewRoleName}
            placeholder="e.g., Most Creative Speaker"
            required
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nominees
            </label>
            {nominees.map((nominee, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <Input
                  value={nominee}
                  onChange={(value) => updateNominee(index, value)}
                  placeholder={`Nominee ${index + 1}`}
                  className="flex-1"
                />
                {nominees.length > 1 && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => removeNominee(index)}
                  >
                    ×
                  </Button>
                )}
              </div>
            ))}
            <Button variant="ghost" size="sm" onClick={addNomineeField}>
              + Add Nominee
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminSetup;