import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, LoaderCircle, Mail, Users } from "lucide-react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface LeadRow {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  result_title: string | null;
  score: number | null;
  created_at: string;
}

export const Leads = () => {
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    void supabase.from("leads")
      .select("id, full_name, email, phone, result_title, score, created_at")
      .order("created_at", { ascending: false })
      .limit(100)
      .then(({ data, error: queryError }) => {
        if (!active) return;
        setLeads(data ?? []);
        setError(Boolean(queryError));
        setLoading(false);
      });
    return () => { active = false; };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-background"><Header /><div className="flex"><Sidebar /><main className="flex-1 p-6">
      <div className="mb-6 flex items-center gap-4"><Button variant="outline" asChild><Link to="/"><ArrowLeft className="mr-2 h-4 w-4" />Dashboard</Link></Button><div><h1 className="text-2xl font-bold">Patient leads</h1><p className="text-sm text-muted-foreground">Quiz submissions shared with your practice</p></div></div>
      <Card><CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" />Recent submissions</CardTitle></CardHeader><CardContent>
        {loading ? <div className="flex items-center justify-center py-12 text-muted-foreground"><LoaderCircle className="mr-2 h-5 w-5 animate-spin" />Loading leads</div>
          : error ? <p role="alert" className="py-10 text-center text-destructive">Leads could not be loaded. Try refreshing this page.</p>
            : leads.length === 0 ? <div className="py-12 text-center"><Users className="mx-auto mb-3 h-8 w-8 text-muted-foreground" /><p className="font-medium">No leads yet</p><p className="mt-1 text-sm text-muted-foreground">Published quiz submissions will appear here.</p></div>
              : <div className="divide-y divide-border">{leads.map((lead) => <article key={lead.id} className="grid gap-3 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
                <div><h2 className="font-medium">{lead.full_name}</h2><a className="mt-1 inline-flex items-center gap-1 text-sm text-primary underline-offset-4 hover:underline" href={`mailto:${lead.email}`}><Mail className="h-3.5 w-3.5" />{lead.email}</a>{lead.phone && <p className="mt-1 text-sm text-muted-foreground">{lead.phone}</p>}{lead.result_title && <p className="mt-2 text-sm text-muted-foreground">Result: {lead.result_title}{lead.score !== null ? ` · Score ${lead.score}` : ""}</p>}</div>
                <time className="text-xs text-muted-foreground" dateTime={lead.created_at}>{new Date(lead.created_at).toLocaleString()}</time>
              </article>)}</div>}
      </CardContent></Card>
    </main></div></div>
  );
};