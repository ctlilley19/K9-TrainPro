'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal, ModalHeader, ModalContent, ModalFooter } from '@/components/ui/Modal';
import { cn } from '@/lib/utils';
import {
  useHomeworkTemplates,
  useCreateHomeworkTemplate,
  useUpdateHomeworkTemplate,
  useDeleteHomeworkTemplate,
} from '@/hooks';
import type { HomeworkTemplate, HomeworkDifficulty } from '@/types/database';
import {
  BookOpen,
  Plus,
  Search,
  Clock,
  Play,
  Edit2,
  Trash2,
  Copy,
  FileText,
  Video,
  Target,
  ArrowLeft,
  ChevronDown,
  Save,
  X,
} from 'lucide-react';

const difficultyConfig = {
  beginner: { label: 'Beginner', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  intermediate: { label: 'Intermediate', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  advanced: { label: 'Advanced', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
};

interface TemplateFormData {
  title: string;
  description: string;
  instructions: string;
  video_url: string;
  difficulty: HomeworkDifficulty;
  estimated_duration_minutes: number | '';
  skill_focus: string[];
  tips: string;
}

const initialFormData: TemplateFormData = {
  title: '',
  description: '',
  instructions: '',
  video_url: '',
  difficulty: 'beginner',
  estimated_duration_minutes: '',
  skill_focus: [],
  tips: '',
};

export default function HomeworkTemplatesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<HomeworkDifficulty | 'all'>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<HomeworkTemplate | null>(null);
  const [formData, setFormData] = useState<TemplateFormData>(initialFormData);
  const [skillInput, setSkillInput] = useState('');

  const { data: templates, isLoading } = useHomeworkTemplates({ isActive: true });
  const createTemplate = useCreateHomeworkTemplate();
  const updateTemplate = useUpdateHomeworkTemplate();
  const deleteTemplate = useDeleteHomeworkTemplate();

  const filteredTemplates = templates?.filter((template) => {
    const matchesSearch =
      template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = difficultyFilter === 'all' || template.difficulty === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  });

  const openCreateModal = () => {
    setFormData(initialFormData);
    setEditingTemplate(null);
    setIsCreateModalOpen(true);
  };

  const openEditModal = (template: HomeworkTemplate) => {
    setFormData({
      title: template.title,
      description: template.description || '',
      instructions: template.instructions,
      video_url: template.video_url || '',
      difficulty: template.difficulty,
      estimated_duration_minutes: template.estimated_duration_minutes || '',
      skill_focus: template.skill_focus || [],
      tips: template.tips || '',
    });
    setEditingTemplate(template);
    setIsCreateModalOpen(true);
  };

  const closeModal = () => {
    setIsCreateModalOpen(false);
    setEditingTemplate(null);
    setFormData(initialFormData);
    setSkillInput('');
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.skill_focus.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        skill_focus: [...formData.skill_focus, skillInput.trim()],
      });
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setFormData({
      ...formData,
      skill_focus: formData.skill_focus.filter((s) => s !== skill),
    });
  };

  const handleSubmit = async () => {
    try {
      const data = {
        title: formData.title,
        description: formData.description || undefined,
        instructions: formData.instructions,
        video_url: formData.video_url || undefined,
        difficulty: formData.difficulty,
        estimated_duration_minutes: formData.estimated_duration_minutes ? Number(formData.estimated_duration_minutes) : undefined,
        skill_focus: formData.skill_focus.length > 0 ? formData.skill_focus : undefined,
        tips: formData.tips || undefined,
      };

      if (editingTemplate) {
        await updateTemplate.mutateAsync({ id: editingTemplate.id, data });
      } else {
        await createTemplate.mutateAsync(data);
      }
      closeModal();
    } catch (error) {
      console.error('Failed to save template:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      try {
        await deleteTemplate.mutateAsync(id);
      } catch (error) {
        console.error('Failed to delete template:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Homework Templates"
        description="Create reusable homework templates for quick assignment"
        breadcrumbs={[
          { label: 'Homework', href: '/homework' },
          { label: 'Templates' }
        ]}
        action={
          <Button variant="primary" leftIcon={<Plus size={18} />} onClick={openCreateModal}>
            New Template
          </Button>
        }
      />

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search size={16} />}
              className="flex-1"
            />
            <div className="flex gap-2">
              {(['all', 'beginner', 'intermediate', 'advanced'] as const).map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficultyFilter(diff)}
                  className={cn(
                    'px-3 py-2 rounded-lg text-sm font-medium transition-colors capitalize',
                    difficultyFilter === diff
                      ? 'bg-brand-500 text-white'
                      : 'bg-surface-800 text-surface-400 hover:text-white hover:bg-surface-700'
                  )}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      {isLoading ? (
        <div className="text-center py-12 text-surface-500">Loading templates...</div>
      ) : filteredTemplates && filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="hover:border-white/10 transition-colors">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1">{template.title}</h3>
                    <span
                      className={cn(
                        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
                        difficultyConfig[template.difficulty]?.color
                      )}
                    >
                      {difficultyConfig[template.difficulty]?.label}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEditModal(template)}
                      className="p-2 rounded-lg hover:bg-surface-700 transition-colors"
                    >
                      <Edit2 size={16} className="text-surface-400" />
                    </button>
                    <button
                      onClick={() => handleDelete(template.id)}
                      className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                    >
                      <Trash2 size={16} className="text-red-400" />
                    </button>
                  </div>
                </div>

                <p className="text-sm text-surface-400 line-clamp-2 mb-4">
                  {template.description || template.instructions}
                </p>

                <div className="flex items-center gap-4 text-xs text-surface-500 mb-4">
                  {template.estimated_duration_minutes && (
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {template.estimated_duration_minutes} min
                    </span>
                  )}
                  {template.video_url && (
                    <span className="flex items-center gap-1 text-blue-400">
                      <Video size={12} />
                      Video
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Copy size={12} />
                    Used {template.usage_count}x
                  </span>
                </div>

                {template.skill_focus && template.skill_focus.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {template.skill_focus.slice(0, 3).map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-0.5 rounded bg-surface-700 text-xs text-surface-300"
                      >
                        {skill}
                      </span>
                    ))}
                    {template.skill_focus.length > 3 && (
                      <span className="px-2 py-0.5 text-xs text-surface-500">
                        +{template.skill_focus.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                <Link href={`/homework/new?template=${template.id}`}>
                  <Button variant="secondary" size="sm" className="w-full" leftIcon={<Play size={14} />}>
                    Use Template
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText size={48} className="mx-auto text-surface-600 mb-4" />
            <p className="text-surface-500 mb-4">No templates found</p>
            <Button variant="secondary" leftIcon={<Plus size={16} />} onClick={openCreateModal}>
              Create First Template
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={closeModal} size="lg">
        <ModalHeader
          title={editingTemplate ? 'Edit Template' : 'Create Template'}
          onClose={closeModal}
        />
        <ModalContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">
                Title <span className="text-red-400">*</span>
              </label>
              <Input
                placeholder="e.g., Basic Sit Practice"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">
                Description
              </label>
              <Input
                placeholder="Brief description of this homework"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">
                Instructions <span className="text-red-400">*</span>
              </label>
              <textarea
                className="w-full px-4 py-3 rounded-xl bg-surface-800 border border-white/[0.06] text-white placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 min-h-[120px] resize-y"
                placeholder="Step-by-step instructions for the pet parent..."
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1.5">
                  Difficulty
                </label>
                <select
                  className="w-full px-4 py-3 rounded-xl bg-surface-800 border border-white/[0.06] text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as HomeworkDifficulty })}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1.5">
                  Duration (minutes)
                </label>
                <Input
                  type="number"
                  placeholder="e.g., 15"
                  value={formData.estimated_duration_minutes}
                  onChange={(e) => setFormData({ ...formData, estimated_duration_minutes: e.target.value ? parseInt(e.target.value) : '' })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">
                Video URL (optional)
              </label>
              <Input
                placeholder="https://youtube.com/watch?v=..."
                value={formData.video_url}
                onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                leftIcon={<Video size={16} />}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">
                Skills Focus
              </label>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Add a skill..."
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                />
                <Button variant="secondary" onClick={handleAddSkill}>
                  Add
                </Button>
              </div>
              {formData.skill_focus.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.skill_focus.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-700 text-sm text-surface-300"
                    >
                      {skill}
                      <button
                        onClick={() => handleRemoveSkill(skill)}
                        className="hover:text-white"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">
                Tips for Pet Parents
              </label>
              <textarea
                className="w-full px-4 py-3 rounded-xl bg-surface-800 border border-white/[0.06] text-white placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 min-h-[80px] resize-y"
                placeholder="Helpful tips and advice..."
                value={formData.tips}
                onChange={(e) => setFormData({ ...formData, tips: e.target.value })}
              />
            </div>
          </div>
        </ModalContent>
        <ModalFooter>
          <Button variant="secondary" onClick={closeModal}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!formData.title || !formData.instructions || createTemplate.isPending || updateTemplate.isPending}
            leftIcon={<Save size={16} />}
          >
            {editingTemplate ? 'Save Changes' : 'Create Template'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
