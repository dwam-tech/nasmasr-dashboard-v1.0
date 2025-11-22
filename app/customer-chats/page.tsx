"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { fetchUsersSummary } from "@/services/users";

type Person = { id: string; name: string; userCode: string; phone: string; role: string; avatar?: string };
type ConvMessage = { id: string; sender: "advertiser" | "user"; content: string; time: string };
type Conversation = { id: string; advertiser: Person; user: Person; messages: ConvMessage[] };

export default function CustomerChatsPage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const resp = await fetchUsersSummary();
        const mapped: Person[] = resp.users.map((u: any) => ({
          id: String(u.id),
          name: u.name || "مستخدم",
          userCode: u.user_code,
          phone: u.phone || "",
          role: u.role,
          avatar: "/profile.png",
        }));
        setPeople(mapped);
        const adv = mapped.filter((p) => p.role === "advertiser");
        const usr = mapped.filter((p) => p.role === "user");
        const len = Math.max(adv.length, usr.length);
        const convs: Conversation[] = [];
        for (let i = 0; i < len; i++) {
          const a = adv[i % Math.max(1, adv.length)] ?? adv[0] ?? mapped[0];
          const b = usr[i % Math.max(1, usr.length)] ?? usr[0] ?? mapped[1] ?? mapped[0];
          const baseId = `${a.id}-${b.id}`;
          convs.push({
            id: baseId,
            advertiser: a,
            user: b,
            messages: [
              { id: `${baseId}-m1`, sender: "user", content: "السلام عليكم، لدي استفسار عن المنتج", time: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }) },
              { id: `${baseId}-m2`, sender: "advertiser", content: "وعليكم السلام، تفضل بالسؤال", time: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }) },
              { id: `${baseId}-m3`, sender: "user", content: "هل يتوفر التوصيل خلال يومين؟", time: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }) },
              { id: `${baseId}-m4`, sender: "advertiser", content: "نعم، نوفر التوصيل خلال 48 ساعة", time: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }) },
            ],
          });
        }
        setConversations(convs);
        setSelectedConvId(convs[0]?.id ?? null);
      } catch {}
    };
    load();
  }, []);

  const filteredConvs = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return conversations;
    return conversations.filter((c) =>
      c.advertiser.name.toLowerCase().includes(term) ||
      c.advertiser.userCode.toLowerCase().includes(term) ||
      c.user.name.toLowerCase().includes(term) ||
      c.user.userCode.toLowerCase().includes(term) ||
      c.advertiser.phone.toLowerCase().includes(term) ||
      c.user.phone.toLowerCase().includes(term)
    );
  }, [conversations, searchTerm]);

  const selectedConv = useMemo(() => filteredConvs.find((c) => c.id === selectedConvId) || filteredConvs[0] || null, [filteredConvs, selectedConvId]);

  const lastMetaByConv = useMemo(() => {
    const r: Record<string, { text: string; time: string }> = {};
    conversations.forEach((c) => {
      const last = c.messages[c.messages.length - 1];
      r[c.id] = { text: last ? last.content : "", time: last ? last.time : "" };
    });
    return r;
  }, [conversations]);

  return (
    <div className="customer-chats-page">
      <div className="customer-chats-header">
        <div className="header-content">
          <div className="title-section">
            <div className="title-icon">👥</div>
            <div>
              <h1 className="page-title">محادثات العملاء</h1>
              <p className="page-subtitle">عرض المحادثات بين المعلنين والمستخدمين (قراءة فقط)</p>
            </div>
          </div>
        </div>
      </div>

      <div className="customer-chats-layout">
        <aside className="customer-chats-sidebar">
          <div className="customer-chats-search">
            <input
              className="form-input"
              type="text"
              placeholder="بحث بالاسم أو الكود أو الهاتف"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="customer-chats-list">
            {filteredConvs.map((c) => (
              <button
                key={c.id}
                className={`customer-chat-item ${selectedConv?.id === c.id ? "active" : ""}`}
                onClick={() => setSelectedConvId(c.id)}
              >
                <Image src={c.advertiser.avatar || "/profile.png"} alt="" width={32} height={32} className="chat-avatar" />
                <Image src={c.user.avatar || "/profile.png"} alt="" width={28} height={28} className="chat-avatar small" />
                <div className="customer-chat-meta">
                  <div className="customer-chat-names">{c.advertiser.name} ↔ {c.user.name}</div>
                  <div className="customer-chat-last">
                    <span className="last-text">{lastMetaByConv[c.id]?.text}</span>
                    <span className="last-time">{lastMetaByConv[c.id]?.time}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </aside>

        <section className="customer-chat-pane">
          {selectedConv ? (
            <>
              <div className="customer-chat-header">
                <div className="participants">
                  <div className="participant">
                    <Image src={selectedConv.advertiser.avatar || "/profile.png"} alt="" width={36} height={36} className="chat-avatar" />
                    <div className="participant-meta">
                      <div className="participant-name">{selectedConv.advertiser.name}</div>
                      <div className="participant-role">معلن</div>
                    </div>
                  </div>
                  <div className="participant">
                    <Image src={selectedConv.user.avatar || "/profile.png"} alt="" width={36} height={36} className="chat-avatar" />
                    <div className="participant-meta">
                      <div className="participant-name">{selectedConv.user.name}</div>
                      <div className="participant-role">مستخدم</div>
                    </div>
                  </div>
                </div>
                <div className="view-only">مشاهدة فقط</div>
              </div>

              <div className="customer-chat-bubbles">
                {selectedConv.messages.map((m) => (
                  <div key={m.id} className={`cust-bubble ${m.sender === "advertiser" ? "advertiser" : "user"}`}>
                    <div className="bubble-content">{m.content}</div>
                    <div className="bubble-time">{m.time}</div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🗂️</div>
              <h3>لا توجد محادثات لعرضها</h3>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}