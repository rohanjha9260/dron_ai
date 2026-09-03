import React, { useState } from 'react';
import { 
  Cpu, 
  Sparkles, 
  Layers, 
  Server, 
  Database, 
  Network, 
  Radio, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';

export const SystemDesignExplorerPage: React.FC = () => {
  const architectures = [
    {
      id: 'arch_ratelimiter',
      title: 'Distributed API Rate Limiter (Token Bucket / Redis)',
      description: 'Protect microservices from DDoS and noisy-neighbor spikes with sub-millisecond atomic token buckets.',
      components: [
        { name: 'Client & Mobile Apps', role: 'Initiates HTTP requests with API Key header.', tech: 'HTTP / gRPC' },
        { name: 'API Gateway / Reverse Proxy', role: 'Terminates SSL, routes traffic, and calls rate limiter middleware.', tech: 'Nginx / Kong' },
        { name: 'Redis Cache Cluster', role: 'Performs atomic INCR and EXPIRE operations on token buckets.', tech: 'Redis In-Memory' },
        { name: 'Application Microservices', role: 'Processes verified requests or drops with 429 Too Many Requests.', tech: 'Java / Node.js' }
      ],
      bottlenecks: 'Race conditions during concurrent distributed requests resolved by Redis Lua scripts.',
      interviewQuestion: 'How do you handle rate limiting when your Redis cluster fails? (Ans: Graceful fail-open with local in-memory fallback).'
    },
    {
      id: 'arch_urlshortener',
      title: 'Scalable URL Shortener (TinyURL Architecture)',
      description: 'High-throughput system handling 100M+ URL redirections per day with Base62 encoding and read-heavy caching.',
      components: [
        { name: 'Load Balancer', role: 'Distributes read/write traffic across stateless API servers.', tech: 'AWS ALB / Round Robin' },
        { name: 'Base62 Encoding Service', role: 'Converts auto-incrementing 64-bit IDs into 7-character short codes.', tech: 'Go / Java' },
        { name: 'Redis LRU Cache', role: 'Caches the top 20% most requested URLs (80/20 Pareto rule).', tech: 'Redis Caching' },
        { name: 'Relational Database (Sharded)', role: 'Stores persistent mapping of shortCode -> originalUrl.', tech: 'PostgreSQL / MySQL' }
      ],
      bottlenecks: 'Database write contention on auto-increment IDs resolved by pre-allocating range tokens with ZooKeeper.',
      interviewQuestion: 'How do you guarantee short codes never collide across distributed server nodes?'
    },
    {
      id: 'arch_chat',
      title: 'Real-Time Chat Engine (WebSockets + Redis Pub/Sub)',
      description: 'Low-latency bidirectional messaging supporting 1M+ active connections with room presence and offline persistence.',
      components: [
        { name: 'WebSocket Connection Manager', role: 'Maintains long-lived duplex TCP connections with connected clients.', tech: 'Node.js / Netty' },
        { name: 'Redis Pub/Sub Layer', role: 'Broadcasts messages across servers when user is connected to a different node.', tech: 'Redis Channels' },
        { name: 'Message Storage Engine', role: 'Appends chat history in append-only LSM trees.', tech: 'Cassandra / ScyllaDB' },
        { name: 'Push Notification Worker', role: 'Delivers APNs/FCM notifications if recipient is offline.', tech: 'Kafka + FCM' }
      ],
      bottlenecks: 'Connection exhaustion (C10K problem) managed by horizontal WebSocket gateway clustering.',
      interviewQuestion: 'Why is Cassandra preferred over traditional SQL for chat messaging history?'
    }
  ];

  const [selectedArch, setSelectedArch] = useState(architectures[0]);

  return (
    <div className="space-y-8 pb-12">
      
      {/* Page Header */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest font-mono">
          High-Level Architecture Visualizer
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
          Interactive System Design Architectural Explorer
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
          Explore production-grade distributed architectures. Master caching trade-offs, message brokers, database partitioning, and high-concurrency interview questions.
        </p>
      </div>

      {/* Architecture Tabs */}
      <div className="flex flex-wrap gap-2">
        {architectures.map(a => (
          <button
            key={a.id}
            onClick={() => setSelectedArch(a)}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              selectedArch.id === a.id
                ? 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-md'
                : 'glass-panel border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            {a.title}
          </button>
        ))}
      </div>

      {/* Active System Architecture Canvas Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
        
        <div className="pb-4 border-b border-white/10 space-y-1">
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider font-mono">Active Topology</span>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-display">{selectedArch.title}</h2>
          <p className="text-xs text-slate-400">{selectedArch.description}</p>
        </div>

        {/* Visual Component Pipeline Flow */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {selectedArch.components.map((comp, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-2.5 flex flex-col justify-between hover:border-cyan-500/40 transition-all group">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-mono text-cyan-400 font-bold">Node 0{idx + 1}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                    {comp.tech}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white font-display group-hover:text-cyan-300 transition-colors">
                  {comp.name}
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{comp.role}</p>
              </div>

              <div className="pt-2 text-[10px] text-slate-500 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Active Data Flow</span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottlenecks & Interview Deep Dive */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 text-xs">
          
          <div className="p-5 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-1.5">
            <span className="font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-4 h-4" /> Scalability Bottleneck & Mitigation
            </span>
            <p className="text-slate-300 leading-relaxed pt-1">{selectedArch.bottlenecks}</p>
          </div>

          <div className="p-5 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 space-y-1.5">
            <span className="font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
              <Info className="w-4 h-4 text-cyan-400" /> Must-Know Interview Question
            </span>
            <p className="text-slate-300 leading-relaxed pt-1 font-medium">{selectedArch.interviewQuestion}</p>
          </div>

        </div>

      </div>

    </div>
  );
};
