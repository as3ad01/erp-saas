"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BELTS, BRANCHES, CLASSES, type Member, type Plan } from "../data";
import { relDays } from "../format";
import { fmt } from "../i18n";
import { subStatus } from "../logic";
import { useDemo } from "../state";
import { BeltChip } from "../components/belt";
import { MemberAvatar, NativeSelect, PageHeader, ProgressBar, StatusBadge } from "../components/bits";

export function MembersPage() {
  const { d, L, members, parentById, can } = useDemo();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [belt, setBelt] = useState("all");
  const [status, setStatus] = useState("all");
  const [branch, setBranch] = useState("all");
  const [adding, setAdding] = useState(false);

  const needle = q.trim().toLowerCase();
  const rows = members.filter((m) => {
    if (belt !== "all" && String(m.belt) !== belt) return false;
    if (status !== "all" && subStatus(m) !== status) return false;
    if (branch !== "all" && m.branchId !== branch) return false;
    if (!needle) return true;
    const parent = parentById(m.parentId);
    return (
      m.name.en.toLowerCase().includes(needle) ||
      m.name.ar.includes(needle) ||
      (parent?.phone.replace(/\s/g, "").includes(needle.replace(/\s/g, "")) ?? false) ||
      (parent?.name.en.toLowerCase().includes(needle) ?? false) ||
      (parent?.name.ar.includes(needle) ?? false)
    );
  });

  const showBelt = can("belts");
  const showBranch = can("branches");

  return (
    <div>
      <PageHeader
        title={d.members.title}
        subtitle={fmt(d.members.subtitle, { n: members.length })}
        actions={
          <Button onClick={() => setAdding(true)}>
            <Plus />
            {d.members.add}
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <div className="relative min-w-52 flex-1 sm:max-w-sm">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={d.members.searchPh}
            className="h-9 ps-9"
          />
        </div>
        {showBelt && (
          <NativeSelect value={belt} onChange={setBelt} className="w-40">
            <option value="all">{d.members.allBelts}</option>
            {BELTS.map((b, i) => (
              <option key={b.id} value={i}>
                {L(b.name)}
              </option>
            ))}
          </NativeSelect>
        )}
        <NativeSelect value={status} onChange={setStatus} className="w-44">
          <option value="all">{d.members.allStatus}</option>
          <option value="active">{d.status.active}</option>
          <option value="expiring">{d.status.expiring}</option>
          <option value="expired">{d.status.expired}</option>
        </NativeSelect>
        {showBranch && (
          <NativeSelect value={branch} onChange={setBranch} className="w-44">
            <option value="all">{d.members.allBranches}</option>
            {BRANCHES.map((b) => (
              <option key={b.id} value={b.id}>
                {L(b.name)}
              </option>
            ))}
          </NativeSelect>
        )}
      </div>

      {rows.length === 0 ? (
        <Card className="py-12 text-center text-muted-foreground">{d.members.noResults}</Card>
      ) : (
        <>
          {/* Desktop table */}
          <Card className="hidden py-0 md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="h-11 ps-4">{d.members.colMember}</TableHead>
                  {showBelt && <TableHead>{d.members.colBelt}</TableHead>}
                  <TableHead>{d.members.colClass}</TableHead>
                  {showBranch && <TableHead>{d.members.colBranch}</TableHead>}
                  <TableHead className="w-36">{d.members.colAttendance}</TableHead>
                  <TableHead className="pe-4">{d.members.colSubscription}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((m) => (
                  <TableRow
                    key={m.id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/demo/members/${m.id}`)}
                  >
                    <TableCell className="py-3 ps-4">
                      <div className="flex items-center gap-3">
                        <MemberAvatar id={m.id} name={m.name} />
                        <div className="min-w-0">
                          <Link
                            href={`/demo/members/${m.id}`}
                            className="block truncate font-medium hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {L(m.name)}
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            {fmt(d.common.yrs, { n: m.age })}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    {showBelt && (
                      <TableCell>
                        <BeltChip belt={m.belt} />
                      </TableCell>
                    )}
                    <TableCell>{L(CLASSES.find((c) => c.id === m.classId)!.name)}</TableCell>
                    {showBranch && <TableCell>{L(BRANCHES.find((b) => b.id === m.branchId)!.name)}</TableCell>}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <ProgressBar value={m.attendance} className="w-16" />
                        <span className="text-xs tabular-nums">{m.attendance}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="pe-4">
                      <SubscriptionCell m={m} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          {/* Mobile cards */}
          <div className="space-y-2 md:hidden">
            {rows.map((m) => (
              <Link key={m.id} href={`/demo/members/${m.id}`}>
                <Card size="sm" className="mb-2 flex-row items-center gap-3 px-3">
                  <MemberAvatar id={m.id} name={m.name} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{L(m.name)}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {L(CLASSES.find((c) => c.id === m.classId)!.name)} · {m.attendance}%
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {showBelt && <BeltChip belt={m.belt} />}
                    <StatusBadge status={subStatus(m)} />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}

      <AddMemberDialog open={adding} onOpenChange={setAdding} />
    </div>
  );
}

function SubscriptionCell({ m }: { m: Member }) {
  const { d, lang } = useDemo();
  const st = subStatus(m);
  return (
    <div className="flex flex-col items-start gap-1">
      <StatusBadge status={st} />
      <span className="text-xs text-muted-foreground">
        {fmt(m.expiresInDays < 0 ? d.members.expiredAgo : d.members.expiresIn, {
          when: relDays(m.expiresInDays, lang),
        })}
      </span>
    </div>
  );
}

function AddMemberDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { d, L, addMember } = useDemo();
  const [name, setName] = useState("");
  const [age, setAge] = useState("9");
  const [parentName, setParentName] = useState("");
  const [phone, setPhone] = useState("");
  const [plan, setPlan] = useState<Plan>("monthly");

  const valid = name.trim().length > 1 && Number(age) >= 3;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    const m = addMember({
      name: name.trim(),
      age: Number(age),
      parentName: parentName.trim() || name.trim(),
      phone: phone.trim() || "+962 79 000 0000",
      plan,
    });
    toast.success(fmt(d.members.added, { name: name.trim(), class: L(CLASSES.find((c) => c.id === m.classId)!.name) }));
    setName("");
    setParentName("");
    setPhone("");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={submit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>{d.members.addTitle}</DialogTitle>
            <DialogDescription>{d.members.addDesc}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-1.5">
            <Label htmlFor="mn-name">{d.members.fullName}</Label>
            <Input id="mn-name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="mn-age">{d.members.age}</Label>
              <Input id="mn-age" type="number" min={3} max={80} value={age} onChange={(e) => setAge(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label>{d.members.plan}</Label>
              <NativeSelect value={plan} onChange={(v) => setPlan(v as Plan)}>
                <option value="monthly">{d.plan.monthly}</option>
                <option value="quarterly">{d.plan.quarterly}</option>
                <option value="annual">{d.plan.annual}</option>
              </NativeSelect>
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="mn-parent">{d.members.parentName}</Label>
            <Input id="mn-parent" value={parentName} onChange={(e) => setParentName(e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="mn-phone">{d.members.parentPhone}</Label>
            <Input id="mn-phone" dir="ltr" className="text-start" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+962 79 123 4567" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {d.common.cancel}
            </Button>
            <Button type="submit" disabled={!valid}>
              {d.members.create}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
