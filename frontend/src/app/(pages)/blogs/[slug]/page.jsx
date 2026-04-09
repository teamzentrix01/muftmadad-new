

'use client';

import React, { useState, useEffect } from 'react';
import { use } from 'react';
import { Clock, Calendar, User, Twitter, Instagram, Linkedin, Youtube, Globe, Quote, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const API = process.env.NEXT_PUBLIC_API_URL;

/* ── Block Renderer ───────────────────────────────────────────────────── */
const BlockRenderer = ({ block }) => {
    const { styles = {}, type, content } = block;
    const containerClasses = `
        ${styles.backgroundColor || 'bg-white'}
        ${styles.textColor || 'text-gray-900'}
        ${styles.padding || 'p-4'}
        ${styles.rounded || 'rounded-lg'}
        ${styles.shadow || 'shadow-none'}
        ${styles.textAlign || 'text-left'}
        mb-6 w-full transition-all duration-300
    `.trim();

    switch (type) {
        case 'subheading':
            return (
                <div id={block.id} className={containerClasses}>
                    <h2 className={`text-3xl font-bold text-gray-800
                        ${styles.underline ? 'underline decoration-gray-300 decoration-2 underline-offset-4' : ''}
                        ${styles.accentBorder ? `border-l-4 ${styles.accentColor || 'border-blue-500'} pl-4` : ''}`}>
                        {content}
                    </h2>
                </div>
            );
        case 'h3':
            return (
                <div id={block.id} className={containerClasses}>
                    <h3 className={`text-xl font-bold text-gray-800
                        ${styles.accentBorder ? `border-l-4 ${styles.accentColor || 'border-blue-500'} pl-4` : ''}`}>
                        {content}
                    </h3>
                </div>
            );
        case 'paragraph':
            return (
                <div className={containerClasses}>
                    <p className="text-lg leading-loose text-gray-700 whitespace-pre-wrap">{content}</p>
                </div>
            );
        case 'highlight':
            return (
                <div className={`${containerClasses} ${styles.accentBorder ? `border-l-8 ${styles.accentColor || 'border-blue-500'}` : ''}`}>
                    <p className="text-lg font-medium leading-relaxed">{content}</p>
                </div>
            );
        case 'step': {
            const sc = typeof content === 'object' ? content : { title: '', description: '' };
            return (
                <div className={`${containerClasses} ${styles.accentBorder ? `border-l-4 ${styles.accentColor || 'border-blue-500'}` : ''}`}>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">{sc.title}</h3>
                    <p className="text-lg leading-relaxed text-gray-600">{sc.description}</p>
                </div>
            );
        }
        case 'quote': {
            const qc = typeof content === 'object' ? content : { text: content, author: '' };
            return (
                <div className={`${containerClasses} relative`}>
                    <Quote size={48} className="absolute -top-4 -left-4 opacity-10 text-gray-900" />
                    <blockquote className={`relative z-10 ${styles.accentBorder ? `border-l-4 ${styles.accentColor || 'border-blue-500'} pl-6` : ''} italic`}>
                        <p className="text-2xl font-serif leading-relaxed mb-4">"{qc.text}"</p>
                        {qc.author && <cite className="block text-base font-semibold not-italic opacity-75">— {qc.author}</cite>}
                    </blockquote>
                </div>
            );
        }
        case 'image':
            return content ? (
                <figure className={`${styles.padding || 'p-0'} ${styles.backgroundColor || ''} ${styles.rounded || 'rounded-lg'} ${styles.shadow || ''} mb-6`}>
                    <img src={content} alt="Blog" className={`w-full object-cover ${styles.rounded || 'rounded-lg'}`} />
                </figure>
            ) : null;
        case 'video':
            return content ? (
                <div className={`${styles.padding || 'p-0'} ${styles.rounded || 'rounded-lg'} mb-6`}>
                    <div className={`aspect-video w-full overflow-hidden bg-black ${styles.rounded || 'rounded-lg'}`}>
                        {content.includes('youtube') || content.includes('youtu.be') ? (
                            <iframe
                                src={content.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/')}
                                title="Video" className="w-full h-full" frameBorder="0" allowFullScreen />
                        ) : (
                            <video src={content} controls className="w-full h-full" />
                        )}
                    </div>
                </div>
            ) : null;
        case 'list':
            return (
                <div className={containerClasses}>
                    <ul className="list-disc pl-6 space-y-3 text-lg text-gray-700">
                        {String(content).split('\n').filter(l => l.trim()).map((line, i) => (
                            <li key={i}>{line}</li>
                        ))}
                    </ul>
                </div>
            );
        case 'numbered-list':
            return (
                <div className={containerClasses}>
                    <ol className="list-decimal pl-6 space-y-3 text-lg text-gray-700">
                        {String(content).split('\n').filter(l => l.trim()).map((line, i) => (
                            <li key={i}>{line}</li>
                        ))}
                    </ol>
                </div>
            );
        case 'social': {
            const links = Array.isArray(content) ? content : [];
            const icons = { twitter: Twitter, instagram: Instagram, linkedin: Linkedin, youtube: Youtube, website: Globe };
            return (
                <div className="flex flex-col items-center justify-center border-t border-gray-100 pt-8 mt-12 mb-6">
                    <p className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">Share this post</p>
                    <div className="flex gap-6">
                        {links.map((link, i) => {
                            const Icon = icons[link.platform] || Globe;
                            return (
                                <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                                    className="p-3 bg-gray-100 rounded-full hover:scale-110 hover:bg-blue-50 hover:text-blue-600 transition-all">
                                    <Icon size={20} />
                                </a>
                            );
                        })}
                    </div>
                </div>
            );
        }
        case 'divider':
            return <hr className="border-gray-200 my-12" />;
        default:
            return null;
    }
};

/* ── Main Page ────────────────────────────────────────────────────────── */
export default function BlogDetailPage({ params }) {
    const { slug } = use(params);
    const router = useRouter();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!slug) return;
        const fetchBlog = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`${API}/blogs/slug/${slug}`);
                setBlog(res.data?.data || null);
            } catch (err) {
                setError(err.response?.data?.message || 'Blog not found.');
            } finally {
                setLoading(false);
            }
        };
        fetchBlog();
    }, [slug]);

    if (loading) return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (error || !blog) return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <div className="flex-1 flex items-center justify-center text-center p-8">
                <div>
                    <p className="text-gray-500 mb-4">{error || 'Blog not found.'}</p>
                    <button onClick={() => router.push('/blogs')}
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
                        ← Back to Blogs
                    </button>
                </div>
            </div>
        </div>
    );

    const blocks = Array.isArray(blog.blocks) ? blog.blocks
        : (typeof blog.blocks === 'string' ? JSON.parse(blog.blocks) : []);

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            {/* Hero */}
            <div className={`relative w-full h-[500px] flex items-center justify-center ${blog.align || 'text-center'} md:mt-22 mt-14`}
                style={{ backgroundImage: `url(${blog.bg_image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <div className="absolute inset-0 bg-black" style={{ opacity: blog.overlay_opacity || 0.6 }} />
                <div className={`relative z-10 p-8 max-w-4xl mx-auto ${blog.text_color || 'text-white'}`}>
                    {blog.tag && (
                        <span className="inline-block px-4 py-1.5 mb-6 rounded-full border border-white/30 bg-white/10 backdrop-blur-md text-sm font-medium tracking-wide">
                            {blog.tag}
                        </span>
                    )}
                    <h1 className="text-4xl md:text-6xl font-serif font-bold leading-tight mb-4 tracking-tight drop-shadow-sm">
                        {blog.title}
                    </h1>
                    {blog.subtitle && (
                        <p className="text-lg md:text-xl opacity-90 font-light mb-8 leading-relaxed max-w-2xl mx-auto">
                            {blog.subtitle}
                        </p>
                    )}
                    <div className="flex items-center justify-center gap-4 text-sm font-medium opacity-80 flex-wrap">
                        {blog.author && <span className="flex items-center gap-1"><User size={14} />{blog.author}</span>}
                        {blog.publish_date && <span className="flex items-center gap-1"><Calendar size={14} />{blog.publish_date}</span>}
                        {blog.read_time && <span className="flex items-center gap-1"><Clock size={14} />{blog.read_time}</span>}
                    </div>
                </div>
            </div>

            {/* Back */}
            <div className="max-w-4xl mx-auto px-4 pt-8">
                <button onClick={() => router.push('/blogs')}
                    className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-8 transition-colors">
                    <ArrowLeft size={14} /> Back to Blogs
                </button>
            </div>

            {/* Content */}
            <article className="max-w-4xl mx-auto px-4 pb-20">
                {blocks.map((block, i) => (
                    <BlockRenderer key={block.id || i} block={block} />
                ))}
            </article>

            <Footer />
        </div>
    );
}