"use client";

import { useEffect, useState } from "react";
import { TopBar } from "@/components/dashboard/TopBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { KnowledgeBaseEntry, Business } from "@/types";
import { toast } from "sonner";
import { Plus, Trash2, Save, BookOpen, Search } from "lucide-react";

export default function KnowledgeBasePage() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [entries, setEntries] = useState<KnowledgeBaseEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // New entry form
  const [showForm, setShowForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [newCategory, setNewCategory] = useState("general");

  useEffect(() => {
    async function load() {
      try {
        const bizRes = await fetch("/api/businesses");
        const businesses = await bizRes.json();
        if (businesses.length > 0) {
          const biz = businesses[0];
          setBusiness(biz);

          const kbRes = await fetch(`/api/businesses/${biz.id}/knowledge-base`);
          const kbEntries = await kbRes.json();
          setEntries(kbEntries);
        }
      } catch (error) {
        console.error("Failed to load knowledge base:", error);
        toast.error("Failed to load knowledge base");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const addEntry = async () => {
    if (!business || !newQuestion.trim() || !newAnswer.trim()) {
      toast.error("Question and answer are required");
      return;
    }

    setSaving("new");
    try {
      const res = await fetch(`/api/businesses/${business.id}/knowledge-base`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: newQuestion,
          answer: newAnswer,
          category: newCategory,
        }),
      });

      if (!res.ok) throw new Error("Failed to add entry");

      const entry = await res.json();
      setEntries([entry, ...entries]);
      setNewQuestion("");
      setNewAnswer("");
      setNewCategory("general");
      setShowForm(false);
      toast.success("Knowledge base entry added! AI receptionist updated.");
    } catch {
      toast.error("Failed to add entry");
    } finally {
      setSaving(null);
    }
  };

  const updateEntry = async (id: string, question: string, answer: string, category: string) => {
    if (!business) return;
    setSaving(id);
    try {
      const res = await fetch(`/api/businesses/${business.id}/knowledge-base/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, answer, category }),
      });

      if (!res.ok) throw new Error("Failed to update");

      const updated = await res.json();
      setEntries(entries.map((e) => (e.id === id ? updated : e)));
      toast.success("Entry updated! AI receptionist synced.");
    } catch {
      toast.error("Failed to update entry");
    } finally {
      setSaving(null);
    }
  };

  const deleteEntry = async (id: string) => {
    if (!business) return;
    setSaving(id);
    try {
      const res = await fetch(`/api/businesses/${business.id}/knowledge-base/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete");

      setEntries(entries.filter((e) => e.id !== id));
      toast.success("Entry removed. AI receptionist updated.");
    } catch {
      toast.error("Failed to delete entry");
    } finally {
      setSaving(null);
    }
  };

  const filteredEntries = entries.filter(
    (e) =>
      e.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group entries by category
  const grouped: Record<string, KnowledgeBaseEntry[]> = {};
  for (const entry of filteredEntries) {
    const cat = entry.category || "general";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(entry);
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-40" />
        ))}
      </div>
    );
  }

  if (!business) {
    return (
      <div className="p-6">
        <TopBar title="Knowledge Base" />
        <div className="text-center py-12 text-gray-500">
          <p>No business found. Complete onboarding first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <TopBar title="Knowledge Base" />

      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="flex items-center gap-3 pt-6">
          <BookOpen className="h-5 w-5 text-blue-600" />
          <div>
            <p className="text-sm text-blue-600 font-medium">AI Knowledge Base</p>
            <p className="text-sm text-blue-800">
              Add questions and answers here. Your AI receptionist will use this information
              to answer caller questions accurately.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search knowledge base..."
            className="pl-10"
          />
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="gap-2 bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add Entry
        </Button>
      </div>

      {showForm && (
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-lg">New Knowledge Base Entry</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Category</Label>
              <Input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="e.g., pricing, services, policies"
              />
            </div>
            <div>
              <Label>Question</Label>
              <Input
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="What question might a caller ask?"
              />
            </div>
            <div>
              <Label>Answer</Label>
              <Textarea
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                placeholder="How should the AI respond?"
                rows={3}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button
                onClick={addEntry}
                disabled={saving === "new"}
                className="gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Save className="h-4 w-4" />
                {saving === "new" ? "Adding..." : "Add Entry"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {entries.length === 0 && !showForm ? (
        <Card>
          <CardContent className="text-center py-12 text-gray-500">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No knowledge base entries yet</p>
            <p className="text-sm mt-1">
              Add questions and answers to help your AI receptionist respond to callers.
            </p>
          </CardContent>
        </Card>
      ) : (
        Object.entries(grouped).map(([category, items]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="text-lg capitalize">{category}</CardTitle>
              <CardDescription>{items.length} {items.length === 1 ? "entry" : "entries"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((entry) => (
                <KBEntryCard
                  key={entry.id}
                  entry={entry}
                  saving={saving === entry.id}
                  onUpdate={updateEntry}
                  onDelete={deleteEntry}
                />
              ))}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

function KBEntryCard({
  entry,
  saving,
  onUpdate,
  onDelete,
}: {
  entry: KnowledgeBaseEntry;
  saving: boolean;
  onUpdate: (id: string, q: string, a: string, cat: string) => void;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [q, setQ] = useState(entry.question);
  const [a, setA] = useState(entry.answer);
  const [cat, setCat] = useState(entry.category);

  if (editing) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg space-y-3">
        <div>
          <Label className="text-xs text-gray-500">Category</Label>
          <Input value={cat} onChange={(e) => setCat(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Question</Label>
          <Input value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Answer</Label>
          <Textarea value={a} onChange={(e) => setA(e.target.value)} rows={3} />
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={() => setEditing(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={saving}
            onClick={() => {
              onUpdate(entry.id, q, a, cat);
              setEditing(false);
            }}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="font-medium text-gray-900">Q: {entry.question}</p>
          <p className="text-sm text-gray-600 mt-1">A: {entry.answer}</p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditing(true)}
            className="text-gray-500 hover:text-blue-600"
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(entry.id)}
            disabled={saving}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </div>
    </div>
  );
}
