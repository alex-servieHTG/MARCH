"use client";

import { useState } from "react";
import { Modal, Input, message } from "antd";
import { z } from "zod";
import { castVote } from "@/app/actions/vote";
import { useDataContext } from "@/app/context/dataContext";

type Props = {
  projectId: string;
  setVotes: (votes: number) => void;
  antdAdjustment: boolean;
};

export default function VoteButton({ projectId, setVotes, antdAdjustment }: Props) {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const { setAllProjects } = useDataContext();

  const handleSubmit = async () => {
    const emailSchema = z.email("Invalid email address");
    const parseResult = emailSchema.safeParse(email);
    if (!parseResult.success) {
      message.error(parseResult.error.issues[0].message);
      return;
    }
    setLoading(true);

    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
      const res = await castVote(projectId, email, tz);
      switch (res.type) {
        case "success":
          setVotes(res.projectVotes);
          setAllProjects(allProjects => allProjects.map(p => p.id === projectId ? { ...p, votes: res.projectVotes } : p))
          message.success("Thanks for voting!");
          break
        case "alreadyVoted":
          message.info("You already voted today!")
          break
        case "error":
          message.error(res.message)
          break
      }
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        message.error(err.message);
      }
    } finally {
      setLoading(false);
      setModalOpen(false);
      setEmail("");
    }
  };

  const verticalSpacing = antdAdjustment ? "py-1 pt-2 mb-1" : "py-2"

  return (
    <>
      <button className={`px-4 border-2 border-black bg-black text-white ${verticalSpacing} hover:opacity-75 hover:border-opacity-75 rounded-md flex items-baseline justify-center`} onClick={() => setModalOpen(true)}>
        <span className="text-xl font-extrabold leading-none">Vote</span>
      </button >
      <Modal
        title="Enter your email"
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        okText="Submit Vote"
        confirmLoading={loading}
      >
        <Input
          type="email"
          name="email"
          data-testid="email-input"
          placeholder="your@email.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </Modal>
    </>
  );
}
