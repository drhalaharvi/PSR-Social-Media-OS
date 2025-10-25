
import React, { useState, useEffect } from 'react';
import { api, InboxItem, ReplyTemplate } from '../../services/api';
import { Bot, Send, Edit, Archive, MessageSquare, Star, Loader2, AlertTriangle, FileText } from 'lucide-react';

const InboxPage: React.FC = () => {
  const [items, setItems] = useState<InboxItem[]>([]);
  const [templates, setTemplates] = useState<ReplyTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState<Record<string, { text: string; escalation: boolean }>>({});
  const [loadingDraft, setLoadingDraft] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [inboxItems, replyTemplates] = await Promise.all([
        api.getInboxItems(),
        api.getReplyTemplates(),
      ]);
      setItems(inboxItems);
      setTemplates(replyTemplates);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleDraftReply = async (item: InboxItem) => {
    setLoadingDraft(item.id);
    const result = await api.getInboxReply(item);
    setDrafts(prev => ({ ...prev, [item.id]: { text: result.draft, escalation: result.escalation } }));
    setLoadingDraft(null);
  };
  
  const handleFlag = (itemId: string) => {
      setItems(prevItems => prevItems.map(item => 
          item.id === itemId ? { ...item, flagged: !item.flagged } : item
      ));
      const item = items.find(i => i.id === itemId);
      if (item) api.flagInboxItem(itemId, !item.flagged);
  }

  const applyTemplate = (itemId: string, text: string) => {
    setDrafts(prev => ({ ...prev, [itemId]: { text, escalation: false } }));
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Unified Inbox</h1>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading conversations...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Unified Inbox</h1>
      <p className="mt-2 text-gray-600 dark:text-gray-400">All your conversations from every channel, in one place.</p>
      <div className="mt-8 space-y-6">
        {items.map(item => (
          <div key={item.id} className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all ${item.flagged ? 'border-2 border-yellow-400' : ''}`}>
            <div className="p-6 border-b dark:border-gray-700">
              <div className="flex justify-between items-start">
                  <div>
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="w-5 h-5 text-gray-400"/>
                        <span className="font-semibold text-gray-800 dark:text-gray-200">{item.author}</span>
                        <span className="text-xs text-gray-500">• {item.source}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{item.timestamp}</p>
                  </div>
                   <button onClick={() => handleFlag(item.id)} className={`p-2 rounded-full hover:bg-yellow-100 dark:hover:bg-yellow-900/50 ${item.flagged ? 'text-yellow-500' : 'text-gray-400'}`}>
                      <Star className="w-5 h-5" />
                   </button>
              </div>
              <p className="mt-4 text-gray-700 dark:text-gray-300">{item.content}</p>
              <div className="mt-3 flex gap-2">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${ item.sentiment === 'Positive' ? 'bg-green-100 text-green-800' : item.sentiment === 'Negative' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>{item.sentiment}</span>
                  <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-800">{item.intent}</span>
              </div>
            </div>

            <div className="p-6 bg-brand-light/20 dark:bg-gray-700/50">
              {!drafts[item.id] && (
                <button onClick={() => handleDraftReply(item)} disabled={loadingDraft === item.id} className="flex items-center bg-brand-primary text-white font-semibold py-2 px-4 rounded-lg text-sm hover:bg-brand-secondary transition-colors disabled:opacity-50">
                   {loadingDraft === item.id ? <Loader2 className="w-5 h-5 mr-2 animate-spin"/> : <Bot className="w-5 h-5 mr-2"/>}
                   {loadingDraft === item.id ? 'Thinking...' : 'Draft Reply'}
                </button>
              )}

              {drafts[item.id] && (
                <div>
                   {drafts[item.id].escalation ? (
                     <div className="flex items-center p-4 rounded-md bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300">
                        <AlertTriangle className="w-6 h-6 mr-3"/>
                        <div>
                           <p className="font-bold">Clinical Escalation Required</p>
                           <p className="text-sm">This query appears to be medical in nature and should be handled by a qualified clinician.</p>
                        </div>
                     </div>
                   ) : (
                     <div>
                        <div className="flex items-center text-brand-primary dark:text-brand-secondary font-semibold mb-2">
                           <Bot className="w-5 h-5 mr-2"/> AI Suggested Reply
                        </div>
                        <textarea
                           value={drafts[item.id].text}
                           onChange={(e) => setDrafts(prev => ({...prev, [item.id]: {...prev[item.id], text: e.target.value}}))}
                           rows={4}
                           className="w-full p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md"
                        />
                        <div className="mt-2">
                            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Or apply a template:</p>
                            <div className="flex flex-wrap gap-2">
                                {templates.map(t => (
                                    <button key={t.id} onClick={() => applyTemplate(item.id, t.text)} className="text-xs flex items-center bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">
                                        <FileText className="w-3 h-3 mr-1.5"/> {t.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="mt-4 space-x-2">
                           <button className="bg-brand-primary text-white font-semibold py-2 px-4 rounded-lg text-sm hover:bg-brand-secondary transition-colors">Send Reply</button>
                           <button className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-2 px-4 rounded-lg text-sm hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors flex items-center">
                             <Archive className="w-4 h-4 mr-2"/> Archive
                           </button>
                        </div>
                     </div>
                   )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InboxPage;
