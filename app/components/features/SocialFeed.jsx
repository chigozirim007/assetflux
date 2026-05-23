'use client';

import { useMemo, useState } from 'react';
import { useAppState } from '../../context/AppStateContext';

export const CATEGORY_LABELS = {
  crypto: 'Crypto',
  forex: 'Forex',
  stocks: 'Stocks',
  shares: 'Shares & ETFs',
  'real-estate': 'Real Estate',
};

function EmptyPanel({ title, body }) {
  return (
    <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950/60 p-4">
      <p className="text-sm font-bold text-white">{title}</p>
      <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{body}</p>
    </div>
  );
}

function PostComposer({ categories, defaultCategory }) {
  const { createPost } = useAppState();
  const [category, setCategory] = useState(defaultCategory || categories[0] || '');
  const [content, setContent] = useState('');

  const categoryOptions = categories.length ? categories : Object.keys(CATEGORY_LABELS);

  const submit = () => {
    const body = content.trim();
    if (!body || !category) return;
    createPost({ category, content: body });
    setContent('');
  };

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-black">Create Post</h3>
          <p className="text-xs text-zinc-500">Post to the market feed your audience follows.</p>
        </div>
        {categoryOptions.length === 1 ? (
          <span className="w-fit rounded-full border border-violet-700/50 bg-violet-900/20 px-3 py-1 text-xs font-bold text-violet-300">
            {CATEGORY_LABELS[categoryOptions[0]] || categoryOptions[0]}
          </span>
        ) : (
          <select
            value={category}
            onChange={event => setCategory(event.target.value)}
            className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs font-bold text-white outline-none focus:border-violet-500"
          >
            {categoryOptions.map(item => (
              <option key={item} value={item}>{CATEGORY_LABELS[item] || item}</option>
            ))}
          </select>
        )}
      </div>
      <textarea
        value={content}
        onChange={event => setContent(event.target.value)}
        rows={4}
        placeholder="Share a market note, trade idea, or portfolio update..."
        className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-violet-500"
      />
      <div className="flex justify-end">
        <button
          type="button"
          onClick={submit}
          disabled={!content.trim() || !category}
          className="rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white hover:bg-violet-500 disabled:opacity-50"
        >
          Post
        </button>
      </div>
    </div>
  );
}

function PostCard({ post, canEdit }) {
  const { user, updatePost, deletePost, toggleLikePost, addComment } = useAppState();
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(post.content);
  const [comment, setComment] = useState('');
  const currentUserId = user.id || user.username || user.email || 'local-user';
  const liked = (post.likes || []).includes(currentUserId);
  const lines = post.content.split(/\r?\n/);
  const longPost = lines.length > 5 || post.content.length > 420;

  const save = () => {
    const body = draft.trim();
    if (!body) return;
    updatePost(post.id, { content: body });
    setEditing(false);
  };

  const share = async () => {
    const text = `${post.author.name} on AssetFlux: ${post.content}`;
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (navigator.share) {
      await navigator.share({ title: 'AssetFlux post', text, url });
      return;
    }
    await navigator.clipboard?.writeText(`${text}\n${url}`);
  };

  const submitComment = () => {
    const body = comment.trim();
    if (!body) return;
    addComment(post.id, body);
    setComment('');
  };

  return (
    <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-bold text-white">{post.author.name}</p>
            <span className="text-xs text-zinc-600">@{post.author.username}</span>
            <span className="rounded-full border border-violet-700/50 bg-violet-900/20 px-2 py-0.5 text-[10px] font-bold text-violet-300">
              {CATEGORY_LABELS[post.category] || post.category}
            </span>
          </div>
          <p className="text-[11px] text-zinc-600">{new Date(post.createdAt).toLocaleString()}</p>
        </div>
        {canEdit && (
          <div className="flex gap-2 text-xs">
            <button onClick={() => setEditing(true)} className="rounded-lg border border-zinc-700 px-3 py-1 text-zinc-300 hover:border-violet-500">Edit</button>
            <button onClick={() => deletePost(post.id)} className="rounded-lg border border-red-900/60 px-3 py-1 text-red-300 hover:bg-red-950/40">Delete</button>
          </div>
        )}
      </div>

      {editing ? (
        <div className="space-y-2">
          <textarea value={draft} onChange={event => setDraft(event.target.value)} rows={5} className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm text-white outline-none focus:border-violet-500" />
          <div className="flex justify-end gap-2 text-xs">
            <button onClick={() => { setDraft(post.content); setEditing(false); }} className="rounded-lg border border-zinc-700 px-3 py-1 text-zinc-300">Cancel</button>
            <button onClick={save} className="rounded-lg bg-violet-600 px-3 py-1 font-bold text-white">Save</button>
          </div>
        </div>
      ) : (
        <>
          <p className={`whitespace-pre-wrap text-sm leading-relaxed text-zinc-300 ${longPost && !expanded ? 'line-clamp-5' : ''}`}>
            {post.content}
          </p>
          {longPost && (
            <button onClick={() => setExpanded(value => !value)} className="text-xs font-bold text-cyan-300 hover:text-cyan-200">
              {expanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </>
      )}

      <div className="flex flex-wrap gap-2 border-t border-zinc-800 pt-3 text-xs">
        <button onClick={() => toggleLikePost(post.id)} className={`rounded-lg border px-3 py-1.5 ${liked ? 'border-violet-500 bg-violet-600/20 text-violet-200' : 'border-zinc-700 text-zinc-300'}`}>
          Like ({post.likes?.length || 0})
        </button>
        <button onClick={share} className="rounded-lg border border-zinc-700 px-3 py-1.5 text-zinc-300">
          Share
        </button>
      </div>

      <div className="space-y-2">
        {(post.comments || []).map(item => (
          <div key={item.id} className="rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-xs">
            <p className="font-bold text-zinc-300">@{item.author.username}</p>
            <p className="mt-1 text-zinc-500">{item.content}</p>
          </div>
        ))}
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={comment}
            onChange={event => setComment(event.target.value)}
            placeholder="Add a comment..."
            className="min-w-0 flex-1 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white outline-none focus:border-violet-500"
          />
          <button onClick={submitComment} disabled={!comment.trim()} className="rounded-xl border border-zinc-700 px-4 py-2 text-xs font-bold text-zinc-200 hover:border-violet-500 disabled:opacity-50">
            Comment
          </button>
        </div>
      </div>
    </article>
  );
}

export default function SocialFeed({ category = '', mode = 'category', showComposer = true, title = 'Posts' }) {
  const { posts, selectedCategories, user } = useAppState();
  const currentUserId = user.id || user.username || user.email || 'local-user';
  const categories = selectedCategories.length ? selectedCategories : Object.keys(CATEGORY_LABELS);

  const visiblePosts = useMemo(() => {
    if (mode === 'mine') {
      return posts.filter(post => post.author.id === currentUserId);
    }
    if (category) return posts.filter(post => post.category === category);
    return posts;
  }, [posts, mode, category, currentUserId]);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-black">{title}</h2>
        {category && <span className="text-xs text-zinc-500">{CATEGORY_LABELS[category] || category}</span>}
      </div>
      {showComposer && <PostComposer categories={categories} defaultCategory={category || categories[0]} />}
      {visiblePosts.length ? (
        <div className="space-y-3">
          {visiblePosts.map(post => (
            <PostCard key={post.id} post={post} canEdit={post.author.id === currentUserId} />
          ))}
        </div>
      ) : (
        <EmptyPanel
          title={mode === 'mine' ? 'No posts published' : 'No posts in this feed yet'}
          body={mode === 'mine'
            ? 'Your market notes and portfolio updates will show here after you publish them.'
            : 'Create the first post for this market, or switch to another category feed.'}
        />
      )}
    </section>
  );
}
