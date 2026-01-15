'use client';

import Link from 'next/link';
import { PageHeader } from '@/components/layout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import {
  Users,
  UserPlus,
  Target,
  Settings,
  Mail,
  Phone,
  MoreVertical,
} from 'lucide-react';

// Mock team data
const teamMembers = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah@k9protrain.com',
    phone: '(555) 123-4567',
    role: 'owner',
    avatar: null,
    dogsAssigned: 8,
    status: 'active',
  },
  {
    id: '2',
    name: 'Mike Wilson',
    email: 'mike@k9protrain.com',
    phone: '(555) 234-5678',
    role: 'trainer',
    avatar: null,
    dogsAssigned: 6,
    status: 'active',
  },
  {
    id: '3',
    name: 'Emily Davis',
    email: 'emily@k9protrain.com',
    phone: '(555) 345-6789',
    role: 'trainer',
    avatar: null,
    dogsAssigned: 5,
    status: 'active',
  },
];

const stats = {
  totalMembers: 3,
  activeTrainers: 2,
  totalAssignments: 19,
};

const roleColors: Record<string, string> = {
  owner: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  admin: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  trainer: 'bg-green-500/20 text-green-400 border-green-500/30',
};

export default function TeamPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Team"
        description="Manage trainers and staff assignments"
        action={
          <Button variant="primary" leftIcon={<UserPlus size={18} />}>
            Add Team Member
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-purple-500/20 to-purple-500/5 border-purple-500/20">
          <CardContent className="p-4 text-center">
            <Users size={24} className="mx-auto text-purple-400 mb-2" />
            <p className="text-2xl font-bold text-white">{stats.totalMembers}</p>
            <p className="text-xs text-surface-500">Team Members</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/20 to-green-500/5 border-green-500/20">
          <CardContent className="p-4 text-center">
            <Users size={24} className="mx-auto text-green-400 mb-2" />
            <p className="text-2xl font-bold text-white">{stats.activeTrainers}</p>
            <p className="text-xs text-surface-500">Active Trainers</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 border-blue-500/20">
          <CardContent className="p-4 text-center">
            <Target size={24} className="mx-auto text-blue-400 mb-2" />
            <p className="text-2xl font-bold text-white">{stats.totalAssignments}</p>
            <p className="text-xs text-surface-500">Dog Assignments</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="flex gap-4">
        <Link href="/manager/trainers">
          <Button variant="outline" leftIcon={<Users size={18} />}>
            Manage Trainers
          </Button>
        </Link>
        <Link href="/manager/assignments">
          <Button variant="outline" leftIcon={<Target size={18} />}>
            Assignments
          </Button>
        </Link>
      </div>

      {/* Team Members */}
      <Card>
        <CardHeader title="Team Members" />
        <CardContent>
          <div className="space-y-4">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-4 p-4 rounded-xl bg-surface-800/50 hover:bg-surface-800 transition-colors"
              >
                <Avatar name={member.name} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-white">{member.name}</h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${
                        roleColors[member.role]
                      }`}
                    >
                      {member.role}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-surface-400">
                    <span className="flex items-center gap-1">
                      <Mail size={14} />
                      {member.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone size={14} />
                      {member.phone}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-white">
                    {member.dogsAssigned}
                  </p>
                  <p className="text-xs text-surface-500">dogs assigned</p>
                </div>
                <button className="p-2 rounded-lg hover:bg-surface-700 text-surface-400 hover:text-white transition-colors">
                  <MoreVertical size={18} />
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
