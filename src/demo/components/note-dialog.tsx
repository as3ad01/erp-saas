"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CLUB, type Member } from "../data";
import { fmt } from "../i18n";
import { useDemo } from "../state";
import { useRetained } from "../use-retained";

function NoteForm({ member, onClose }: { member: Member; onClose: () => void }) {
  const { d, L, parentById, sendNote } = useDemo();
  const parent = parentById(member.parentId);
  const first = L(member.name).split(" ")[0];
  const [text, setText] = useState(fmt(d.profile.noteDefault, { name: first, club: L(CLUB.name) }));
  const parentName = parent ? L(parent.name) : "";

  return (
    <>
      <DialogHeader>
        <div className="mb-1 flex size-10 items-center justify-center rounded-full bg-[#25d366]/15 text-[#128c4a]">
          <MessageCircle className="size-5" />
        </div>
        <DialogTitle>{fmt(d.profile.noteTitle, { parent: parentName })}</DialogTitle>
        <DialogDescription>{d.profile.noteDesc}</DialogDescription>
      </DialogHeader>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        className="w-full resize-none rounded-lg border border-input bg-transparent px-2.5 py-2 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"
      />
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          {d.common.cancel}
        </Button>
        <Button
          disabled={!text.trim()}
          onClick={() => {
            sendNote(member.id, text.trim());
            toast.success(fmt(d.profile.messageSent, { parent: parentName }));
            onClose();
          }}
        >
          {d.profile.noteSend}
        </Button>
      </DialogFooter>
    </>
  );
}

/** Lets the coach send a free-text WhatsApp message to a member's parent. */
export function NoteDialog({ member, onClose }: { member: Member | null; onClose: () => void }) {
  const shown = useRetained(member);
  return (
    <Dialog open={!!member} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>{shown && <NoteForm key={shown.id} member={shown} onClose={onClose} />}</DialogContent>
    </Dialog>
  );
}
