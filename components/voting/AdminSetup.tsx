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
  adminEmail?: string;
}

const AdminSetup: React.FC<AdminSetupProps> = ({ onMeetingCreated, existingMeeting, adminEmail }) => {
  // Meeting date first (required) then optional meeting theme
  const [meetingDate, setMeetingDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  });
  const [meetingName, setMeetingName] = useState("");

  // Helper to generate a short random code for meeting slug
  const generateCode = (len = 6) => {
    return Math.random().toString(36).replace(/[^a-z0-9]+/g, '').slice(-len);
  };
  const [roles, setRoles] = useState<VotingRole[]>([]);
  const [showAddRole, setShowAddRole] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load existing meeting data for editing
  useEffect(() => {
    if (existingMeeting) {
      setMeetingName(existingMeeting.name);
      setMeetingDate(existingMeeting.date);
      setRoles(existingMeeting.roles);
    }
  }, [existingMeeting]);
  
  const [newRoleName, setNewRoleName] = useState("");
  const [nominees, setNominees] = useState<string[]>([""]);

  const defaultRoles = [
    "Best Speaker",
    "Best Table Topics", 
    "Best Evaluator",
    "Best Role Player",
    "Best Tag Role Player"
  ];

  const addDefaultRoles = () => {
    const newRoles = defaultRoles.map((roleName, index) => ({
      id: `role-${Date.now()}-${index}`,
      name: roleName,
      nominees: [
        { name: "", prefix: "TM" as const, suffix: "" }, 
        { name: "", prefix: "TM" as const, suffix: "" }
      ] // Start with 2 empty nominee fields
    }));
    setRoles(newRoles);
  };

  const addCustomRole = () => {
    if (!newRoleName.trim()) return;
    
    const validNominees = nominees.filter(n => n.trim() !== "").map(name => ({
      name,
      prefix: "TM" as const,
      suffix: ""
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

  const updateRoleNomineeSuffix = (roleId: string, nomineeIndex: number, suffix: string) => {
    setRoles(roles.map(role => 
      role.id === roleId 
        ? {
            ...role, 
            nominees: role.nominees.map((nominee, index) => 
              index === nomineeIndex ? { ...nominee, suffix } : nominee
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
        ? { ...role, nominees: [...role.nominees, { name: "", prefix: "TM" as const, suffix: "" }] }
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
    if (!meetingDate || roles.length === 0) {
      alert("Please set the meeting date and add at least one role.");
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
            name: meetingName.trim() || `Meeting - ${meetingDate}`,
            date: meetingDate,
            clubName: "Toastmasters Club",
            roles: processedRoles,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to update meeting');
        }

        const { meeting } = await response.json();
        // extract short code from slug
        const parts = existingMeeting.slug.split('-');
        const shortCode = parts[parts.length - 1] || existingMeeting.slug;
        const meetingUrl = `${window.location.origin}/voting/${shortCode}`;
        onMeetingCreated(meeting, meetingUrl);
      } else {
        // Create new meeting - generate a short code and include it in the request
        const code = generateCode(6);

        const response = await fetch('/api/meetings/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: meetingName.trim() || `Meeting - ${meetingDate}`,
            date: meetingDate,
            clubName: "Toastmasters Club",
            createdBy: adminEmail || "admin",
            roles: processedRoles,
            code, // include short code for server/storage
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create meeting');
        }

        const { meeting } = await response.json();

        // Build short URL using our generated code
        const meetingUrl = `${window.location.origin}/voting/${code}`;

        // Reset form only for new meetings
        setMeetingName("");
        setRoles([]);
        setNewRoleName("");
        setNominees([""]);

        onMeetingCreated(meeting, meetingUrl);
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
            label="Meeting Date"
            type="date"
            value={meetingDate}
            onChange={setMeetingDate}
            required
          />
          <Input
            label="Meeting Theme (Optional)"
            value={meetingName}
            onChange={setMeetingName}
            placeholder="e.g., Holiday Special, New Year Kickoff"
          />
        </div>

        <div className="flex gap-3 mb-6">
          <Button onClick={addDefaultRoles} variant="primary">
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
                          className="w-20 flex-shrink-0"
                        />
                        <Input
                          value={nominee.name}
                          onChange={(value) => updateRoleNominee(role.id, index, value)}
                          placeholder={`Nominee ${index + 1}`}
                          className="flex-1"
                        />
                        {/* Suffix handling: special dropdowns for two specific roles, otherwise optional text */}
                        <div className="w-40">
                          {role.name === 'Best Role Player' ? (
                            <>
                              <Select
                                value={
                                  nominee.suffix && ['TMOD','GE','TTM'].includes(nominee.suffix) ? nominee.suffix : (nominee.suffix ? 'other' : '')
                                }
                                onChange={(val) => {
                                  if (val === 'other') {
                                    updateRoleNomineeSuffix(role.id, index, '');
                                  } else {
                                    updateRoleNomineeSuffix(role.id, index, val as string);
                                  }
                                }}
                                options={[
                                  { value: '', label: 'No Suffix' },
                                  { value: 'TMOD', label: 'TMOD' },
                                  { value: 'GE', label: 'GE' },
                                  { value: 'TTM', label: 'TTM' },
                                  { value: 'other', label: 'Other' }
                                ]}
                              />
                              {(!['TMOD','GE','TTM'].includes(nominee.suffix || '') && (nominee.suffix || '') !== '') && (
                                <Input value={nominee.suffix || ''} onChange={(v) => updateRoleNomineeSuffix(role.id, index, v)} placeholder="Custom suffix" className="mt-2" />
                              )}
                            </>
                          ) : role.name === 'Best Tag Role Player' ? (
                            <>
                              <Select
                                value={
                                  nominee.suffix && ['Timer','Grammarian','Ah counter'].includes(nominee.suffix) ? nominee.suffix : (nominee.suffix ? 'other' : '')
                                }
                                onChange={(val) => {
                                  if (val === 'other') {
                                    updateRoleNomineeSuffix(role.id, index, '');
                                  } else {
                                    updateRoleNomineeSuffix(role.id, index, val as string);
                                  }
                                }}
                                options={[
                                  { value: '', label: 'No Suffix' },
                                  { value: 'Timer', label: 'Timer' },
                                  { value: 'Grammarian', label: 'Grammarian' },
                                  { value: 'Ah counter', label: 'Ah counter' },
                                  { value: 'other', label: 'Other' }
                                ]}
                              />
                              {(!['Timer','Grammarian','Ah counter'].includes(nominee.suffix || '') && (nominee.suffix || '') !== '') && (
                                <Input value={nominee.suffix || ''} onChange={(v) => updateRoleNomineeSuffix(role.id, index, v)} placeholder="Custom suffix" className="mt-2" />
                              )}
                            </>
                          ) : (
                            <Input value={nominee.suffix || ''} onChange={(v) => updateRoleNomineeSuffix(role.id, index, v)} placeholder="Suffix (optional)" className="w-40" />
                          )}
                        </div>
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
              disabled={!meetingDate || roles.length === 0 || isSubmitting}
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