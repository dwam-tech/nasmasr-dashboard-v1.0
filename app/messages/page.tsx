"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import Image from "next/image";
import { fetchUsersSummary } from "@/services/users";

type ChatUser = { id: string; name: string; userCode: string; phone: string; avatar?: string };
type ChatMessage = { id: string; sender: "admin" | "user"; content: string; time: string; status?: "sent" | "delivered" };
type QuickReply = { id: string; title: string; content: string };

export default function MessagesPage() {
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messagesByUser, setMessagesByUser] = useState<Record<string, ChatMessage[]>>({});
  const [messageInput, setMessageInput] = useState("");
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const bubblesRef = useRef<HTMLDivElement | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentsPanel, setShowAttachmentsPanel] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const quickReplies: QuickReply[] = [
    { id: "qr1", title: "تحية", content: "مرحبًا، كيف يمكنني مساعدتك؟" },
    { id: "qr2", title: "استلام الطلب", content: "تم استلام طلبك وجاري المراجعة." },
    { id: "qr3", title: "طلب معلومات", content: "هل يمكنك تزويدنا بمزيد من التفاصيل؟" },
    { id: "qr4", title: "شكرًا", content: "شكرًا لتواصلك معنا." },
    { id: "qr5", title: "استفسار", content: "هل لديك أي استفسارات أخرى؟" },
    
  ];

  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const [startSearch, setStartSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const resp = await fetchUsersSummary();
        const mapped: ChatUser[] = resp.users.map((u: any) => ({
          id: String(u.id),
          name: u.name || "مستخدم",
          userCode: u.user_code,
          phone: u.phone || "",
          avatar: "/profile.png",
        }));
        setUsers(mapped);
        const initial: Record<string, ChatMessage[]> = {};
        mapped.forEach((u, i) => {
          initial[u.id] = [
            { id: `${u.id}-m1`, sender: "user", content: "السلام عليكم", time: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }) },
            { id: `${u.id}-m2`, sender: "admin", content: "وعليكم السلام، أهلاً بك", time: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }), status: "delivered" },
          ];
          if (i === 0) setSelectedUserId(u.id);
        });
        setMessagesByUser(initial);
      } catch {}
    };
    load();
  }, []);

  useEffect(() => {
    if (bubblesRef.current) {
      bubblesRef.current.scrollTop = bubblesRef.current.scrollHeight;
    }
  }, [messagesByUser, selectedUserId]);

  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return users;
    return users.filter(
      (u) => u.name.toLowerCase().includes(term) || u.userCode.toLowerCase().includes(term) || u.phone.toLowerCase().includes(term)
    );
  }, [users, searchTerm]);

  const currentMessages = useMemo(() => {
    if (!selectedUserId) return [];
    return messagesByUser[selectedUserId] || [];
  }, [messagesByUser, selectedUserId]);

  const selectedUser = useMemo(() => users.find((u) => u.id === selectedUserId) || null, [users, selectedUserId]);

  const lastUserMessageText = useMemo(() => {
    const msgs = currentMessages;
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].sender === "user") return msgs[i].content;
    }
    return "";
  }, [currentMessages]);

  const smartSuggestions: QuickReply[] = useMemo(() => {
    const text = lastUserMessageText.toLowerCase();
    const suggestions: QuickReply[] = [];
    if (!text) {
      return [
        { id: "s1", title: "كيف أساعد؟", content: "كيف يمكنني مساعدتك؟" },
        { id: "s2", title: "استلام", content: "تم استلام رسالتك وجاري المراجعة." },
      ];
    }
    if (text.includes("السلام")) suggestions.push({ id: "s3", title: "وعليكم السلام", content: "وعليكم السلام، أهلاً بك" });
    if (text.includes("سعر") || text.includes("كم")) suggestions.push({ id: "s4", title: "السعر", content: "سعر المنتج موضح في الإعلان، هل تحتاج تفاصيل إضافية؟" });
    if (text.includes("مكان") || text.includes("اين") || text.includes("عنوان")) suggestions.push({ id: "s5", title: "الموقع", content: "الموقع موضح في الإعلان، يمكنني مساعدتك بالتفاصيل" });
    if (text.includes("وقت") || text.includes("ساعات") || text.includes("موعد")) suggestions.push({ id: "s6", title: "المواعيد", content: "ساعات العمل من 9 صباحًا حتى 9 مساءً" });
    if (suggestions.length === 0) suggestions.push({ id: "s7", title: "معلومات أكثر", content: "هل يمكنك تزويدنا بمزيد من التفاصيل؟" });
    return suggestions;
  }, [lastUserMessageText]);

  const lastMetaByUser = useMemo(() => {
    const r: Record<string, { text: string; time: string }> = {};
    users.forEach((u) => {
      const msgs = messagesByUser[u.id] || [];
      const last = msgs[msgs.length - 1];
      r[u.id] = { text: last ? last.content : "", time: last ? last.time : "" };
    });
    return r;
  }, [users, messagesByUser]);

  const startFilteredUsers = useMemo(() => {
    const term = startSearch.trim().toLowerCase();
    if (!term) return users;
    return users.filter(
      (u) => u.name.toLowerCase().includes(term) || u.userCode.toLowerCase().includes(term) || u.phone.toLowerCase().includes(term)
    );
  }, [users, startSearch]);

  const startConversationWithUser = (u: ChatUser) => {
    if (!messagesByUser[u.id]) {
      setMessagesByUser((prev) => ({ ...prev, [u.id]: [] }));
    }
    setSelectedUserId(u.id);
    setIsStartModalOpen(false);
  };

  const sendMessage = (content: string) => {
    if (!selectedUserId) return;
    const text = content.trim();
    if (!text) return;
    const msg: ChatMessage = {
      id: `${selectedUserId}-${Date.now()}`,
      sender: "admin",
      content: text,
      time: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
      status: "sent",
    };
    setMessagesByUser((prev) => ({ ...prev, [selectedUserId]: [...(prev[selectedUserId] || []), msg] }));
    setMessageInput("");
    setIsTyping(false);
    setTimeout(() => {
      setMessagesByUser((prev) => {
        const list = [...(prev[selectedUserId] || [])];
        const idx = list.findIndex((m) => m.id === msg.id);
        if (idx >= 0) list[idx] = { ...list[idx], status: "delivered" };
        return { ...prev, [selectedUserId]: list };
      });
    }, 800);
  };

  const handleSend = () => sendMessage(messageInput);
  const handleQuickSend = (qr: QuickReply) => sendMessage(qr.content);
  const appendEmoji = (emoji: string) => setMessageInput((prev) => prev + emoji);
  const handleAttachFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((f) => sendMessage(`📎 ${f.name}`));
    e.target.value = "";
    setShowAttachmentsPanel(false);
  };

  return (
    <div className="messages-page">
      <div className="messages-header">
        <div className="header-content">
          <div className="title-section">
            <div className="title-icon">💬</div>
            <div>
              <h1 className="page-title">الرسائل</h1>
              <p className="page-subtitle">محادثة بين المشرف والمستخدم مع ردود سريعة</p>
            </div>
          </div>
        </div>
      </div>

      <div className="messages-layout">
        <aside className="messages-sidebar">
          <div className="messages-search">
            <input
              className="form-input"
              type="text"
              placeholder="بحث بالاسم أو الكود أو الهاتف"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="start-chat-btn" onClick={() => setIsStartModalOpen(true)}>ابدأ محادثة</button>
          </div>
          <div className="messages-list">
            {filteredUsers.map((u) => (
              <button
                key={u.id}
                className={`messages-user-item ${selectedUserId === u.id ? "active" : ""}`}
                onClick={() => setSelectedUserId(u.id)}
              >
                <Image src={u.avatar || "/profile.png"} alt="" width={36} height={36} className="messages-avatar" />
                <div className="messages-user-meta">
                  <div className="messages-user-name">{u.name}</div>
                  {/* <div className="messages-user-code">{u.userCode}</div> */}
                  <div className="messages-user-extra">
                    <span className="last-text">{lastMetaByUser[u.id]?.text}</span>
                    <span className="last-time">{lastMetaByUser[u.id]?.time}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </aside>

        <section className="chat-pane">
          {selectedUser ? (
            <>
              <div className="chat-header">
                <div className="chat-user">
                  <Image src={selectedUser.avatar || "/profile.png"} alt="" width={40} height={40} className="messages-avatar" />
                  <div>
                    <div className="chat-user-name">{selectedUser.name}</div>
                    <div className="chat-user-code">{selectedUser.userCode}</div>
                  </div>
                </div>
                <div className="chat-actions">
                  <button className="quick-replies-toggle" onClick={() => setShowQuickReplies((v) => !v)}>
                    الردود السريعة
                  </button>
                  <button className="quick-replies-toggle" onClick={() => window.location.href = '/users'}>
                    ملف المستخدم
                  </button>
                </div>
              </div>

              {showQuickReplies && (
                <div className="quick-replies-menu">
                  {quickReplies.map((qr) => (
                    <button key={qr.id} className="quick-reply-chip" onClick={() => handleQuickSend(qr)}>
                      {qr.title}
                    </button>
                  ))}
                </div>
              )}

              <div className="smart-suggestions">
                {smartSuggestions.map((qr) => (
                  <button key={qr.id} className="smart-chip" onClick={() => handleQuickSend(qr)}>
                    {qr.title}
                  </button>
                ))}
              </div>

              <div className="chat-bubbles" ref={bubblesRef}>
                {currentMessages.map((m) => (
                  <div key={m.id} className={`chat-bubble ${m.sender === "admin" ? "admin" : "user"}`}>
                    <div className="bubble-content">{m.content}</div>
                    <div className="bubble-time">
                      {m.time}
                      {m.sender === "admin" && (
                        <span className={`bubble-status ${m.status}`}>{m.status === "delivered" ? "✓✓" : "✓"}</span>
                      )}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="typing-indicator">
                    <span></span><span></span><span></span>
                  </div>
                )}
              </div>

              <div className="chat-input">
                <button
                  className="input-action"
                  onClick={() => {
                    if (fileInputRef.current) fileInputRef.current.click();
                    else setShowAttachmentsPanel((v) => !v);
                  }}
                  title="إرفاق"
                >
                  📎
                </button>
                <button
                  className="input-action"
                  onClick={() => setShowEmojiPicker((v) => !v)}
                  title="إيموجي"
                >
                  😊
                </button>
                <input ref={fileInputRef} type="file" multiple style={{ display: "none" }} onChange={handleAttachFiles} />

                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => {
                    setMessageInput(e.target.value);
                    setIsTyping(e.target.value.trim().length > 0);
                  }}
                  placeholder="اكتب رسالتك هنا"
                  className="chat-input-field"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSend();
                  }}
                />

                <button className="send-btn" onClick={handleSend} title="إرسال">
                  <span className="send-icon">✈️</span>
                </button>
              </div>

              {showEmojiPicker && (
                <div className="emoji-menu">
                  {["😀","😂","😍","👍","🙏","🔥","🎉","😎","😉","🙌"].map((e) => (
                    <button key={e} className="emoji-chip" onClick={() => appendEmoji(e)}>{e}</button>
                  ))}
                </div>
              )}

              {showAttachmentsPanel && (
                <div className="attachments-popover">
                  <div className="attachments-title">إرفاق</div>
                  <button className="attachment-option" onClick={() => fileInputRef.current?.click()}>ملفات</button>
                  <button className="attachment-option">صورة</button>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>اختر مستخدمًا لبدء المحادثة</h3>
            </div>
          )}
        </section>
      </div>
      {isStartModalOpen && (
        <div className="modal-overlay" onClick={() => setIsStartModalOpen(false)}>
          <div className="start-chat-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>بدء محادثة</h3>
              <button className="modal-close" onClick={() => setIsStartModalOpen(false)}>✕</button>
            </div>
            <div className="modal-content">
              <div className="start-search">
                <input
                  className="form-input"
                  type="text"
                  placeholder="بحث بالاسم أو الكود أو الهاتف"
                  value={startSearch}
                  onChange={(e) => setStartSearch(e.target.value)}
                />
              </div>
              <div className="start-list">
                {startFilteredUsers.map((u) => (
                  <button key={u.id} className="start-item" onClick={() => startConversationWithUser(u)}>
                    <Image src={u.avatar || "/profile.png"} alt="" width={36} height={36} className="start-avatar" />
                    <div className="start-meta">
                      <div className="start-name">{u.name}</div>
                      <div className="start-sub">
                        <span className="start-code">{u.userCode}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-primary" onClick={() => setIsStartModalOpen(false)}>إغلاق</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}