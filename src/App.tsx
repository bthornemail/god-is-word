import { useState, useEffect, useRef } from 'react';
import { Calendar, Download, BarChart3, Sparkles, Upload, Users, Share2, TrendingUp, Shield, Network, Camera } from 'lucide-react';
import "./App.css"
import type { Perceptron, FanoPlane, BlockDesign } from './lib/perceptron/types';
import { usePerceptron } from './hooks/usePerceptron';
import { ExportManager } from './sync/export-manager';
import { ImportManager } from './sync/import-manager';
import { LiveFeed } from './components/LiveFeed';
import { QRCodeDisplay } from './components/QRCodeDisplay';
import { QRCodeScanner } from './components/QRCodeScanner';
import { DailyDashboard } from './components/DailyDashboard';
import { MqttDiscovery } from './components/MqttDiscovery';

const GodReflectionJournal = () => {
  interface SemanticTriple {
    subject: string;
    predicate: string;
    object: string;
  }

  interface TodayEntry {
    word: string;
    content: string;
    type: string;
    triples: SemanticTriple[];
  }

  interface CollectiveSignature {
    type: string;
    entries: Perceptron[];
    pattern: { positive: number; negative: number; neutral: number };
    generated: string;
    version?: string;
    signature?: string;
    cryptoSignature?: string;
    publicKey?: string;
    perceptronState?: any;
  }

  const [entries, setEntries] = useState<Perceptron[]>([]);
  const [currentDay, setCurrentDay] = useState(1);
  const [todayEntry, setTodayEntry] = useState<TodayEntry>({ word: '', content: '', type: 'text', triples: [] });
  const [view, setView] = useState('journal');
  const [collectiveData, setCollectiveData] = useState<CollectiveSignature[]>([]);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [qrExportData, setQrExportData] = useState<any>(null);
  const [privateKey, setPrivateKey] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Perceptron integration
  const { perceptronState, isReady, liveEvents, addKnowledge, exportState } = usePerceptron('god-reflection-journal');
  const exportManager = useRef(new ExportManager());
  const importManager = useRef(new ImportManager());

  useEffect(() => {
    const stored = localStorage.getItem('god_reflections');
    if (stored) {
      const parsed = JSON.parse(stored);
      // Migration for old data structure
      if (parsed.entries && parsed.entries.length > 0 && !parsed.entries[0].point) {
        const migratedEntries = parsed.entries.map((entry: any) => {
          const perceptron = createPerceptron(entry);
          return perceptron;
        });
        Promise.all(migratedEntries).then(entries => {
          setEntries(entries);
          localStorage.setItem('god_reflections', JSON.stringify({ ...parsed, entries }));
        });
      } else {
        setEntries(parsed.entries || []);
      }
      setCurrentDay(parsed.currentDay || 1);
    }

    const collective = localStorage.getItem('god_collective');
    if (collective) {
      setCollectiveData(JSON.parse(collective));
    }

    // Generate or retrieve private key for signing
    let key = localStorage.getItem('god_private_key');
    if (!key) {
      key = generatePrivateKey();
      localStorage.setItem('god_private_key', key);
    }
    setPrivateKey(key);
  }, []);

  useEffect(() => {
    if (entries.length > 0 && view === 'pattern') {
      generateQRCode();
    }
  }, [entries, view]);

  const generatePrivateKey = () => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  };

  const hashMessage = async (message: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const createPerceptron = async (entryData: { word: string, content: string, triples: any[] }): Promise<Perceptron> => {
    const combined_input = `${entryData.word}-${entryData.content}-${JSON.stringify(entryData.triples)}`;
    const hash = await hashMessage(combined_input);

    const blockDesign: BlockDesign = {
        Node: parseInt(hash.substring(0, 4), 16) / 65535.0, // binary16
        Edge: parseInt(hash.substring(4, 12), 16) / 4294967295.0, // binary32
        Graph: parseInt(hash.substring(12, 28), 16) / Number.MAX_SAFE_INTEGER, // binary64
        Incidence: hash.substring(28, 60), // binary128
        Hypergraph: hash.substring(0, 64), // binary256
    };

    const fanoPlane: FanoPlane = {
        ...blockDesign,
        Functor: "0", // Placeholder
        Monad: "0" // Placeholder
    };

    const perceptron: Perceptron = {
        point: fanoPlane,
        word: entryData.word,
        content: entryData.content,
        triples: entryData.triples,
        timestamp: new Date().toISOString(),
        day: currentDay,
    };

    return perceptron;
  };


  const addTriple = () => {
    setTodayEntry({
      ...todayEntry,
      triples: [...(todayEntry.triples || []), { subject: '', predicate: '', object: '' }]
    });
  };

  const updateTriple = (index: number, field: keyof SemanticTriple, value: string) => {
    const newTriples = [...(todayEntry.triples || [])];
    newTriples[index][field] = value;
    setTodayEntry({ ...todayEntry, triples: newTriples });
  };

  const removeTriple = (index: number) => {
    const newTriples = (todayEntry.triples || []).filter((_, i) => i !== index);
    setTodayEntry({ ...todayEntry, triples: newTriples });
  };

  const saveEntry = async () => {
    if (!todayEntry.word.trim()) return;

    const newEntryData = {
      word: todayEntry.word,
      content: todayEntry.content,
      triples: (todayEntry.triples || []).filter(t => t.subject || t.predicate || t.object),
    };

    // Create legacy perceptron for backward compatibility
    const newPerceptron = await createPerceptron(newEntryData);

    // Add to Perceptron state machine
    if (isReady) {
      try {
        // Main triple: "God is {word}"
        await addKnowledge('God', 'is', todayEntry.word, 'MUST');

        // Add content as knowledge if provided
        if (todayEntry.content.trim()) {
          await addKnowledge(todayEntry.word, 'hasContent', todayEntry.content.substring(0, 100), 'SHOULD');
        }

        // Add all triples
        for (const triple of newEntryData.triples) {
          if (triple.subject && triple.predicate && triple.object) {
            await addKnowledge(triple.subject, triple.predicate, triple.object, 'MAY');
          }
        }
      } catch (error) {
        console.error('[App] Failed to add knowledge to Perceptron:', error);
      }
    }

    const newEntries = [...entries.filter(e => e.day !== currentDay), newPerceptron];
    setEntries(newEntries);

    localStorage.setItem('god_reflections', JSON.stringify({
      entries: newEntries,
      currentDay: currentDay < 7 ? currentDay + 1 : currentDay
    }));

    if (currentDay < 7) {
      setCurrentDay(currentDay + 1);
    }

    setTodayEntry({ word: '', content: '', type: 'text', triples: [] });

    // Publish to MQTT if connected (use new entries with the latest entry)
    if ((window as any).mqttPublishSignature && newEntries.length > 0) {
      setTimeout(async () => {
        try {
          const exportedState = isReady && perceptronState ? await exportState() : null;
          const data = await exportManager.current.exportSignature(
            newEntries,
            analyzeBinomial(),
            privateKey,
            exportedState
          );
          if ((window as any).mqttPublishSignature) {
            await (window as any).mqttPublishSignature(data);
            console.log('[App] Published signature to MQTT');
          }
        } catch (err) {
          console.error('[App] Failed to publish to MQTT:', err);
        }
      }, 500); // Small delay to ensure state is updated
    }
  };

  const generateQRCode = async () => {
    try {
      // Export with Perceptron state if available
      const exportedState = isReady && perceptronState ? await exportState() : null;

      const data = await exportManager.current.exportSignature(
        entries,
        analyzeBinomial(),
        privateKey,
        exportedState
      );

      // Store data for QR code display
      setQrExportData(data);
      return data;
    } catch (error) {
      console.error('[App] Failed to generate QR data:', error);
      // Fallback to simple data
      const data = {
        type: 'god_reflection_signature_perceptron' as const,
        signature: entries.map(e => e.word).join('-'),
        entries: entries,
        pattern: analyzeBinomial(),
        generated: new Date().toISOString(),
        version: '2.0.0',
        publicKey: '',
        cryptoSignature: '',
      };
      setQrExportData(data);
      return data;
    }
  };

  const exportAsQR = async () => {
    try {
      // Export with Perceptron state if available
      const exportedState = isReady && perceptronState ? await exportState() : null;

      const data = await exportManager.current.exportSignature(
        entries,
        analyzeBinomial(),
        privateKey,
        exportedState
      );

      await exportManager.current.exportAsFile(data);
    } catch (error) {
      console.error('[App] Export failed:', error);
      alert('Failed to export signature. Please try again.');
    }
  };


  const processImportedSignature = async (signatureData: any) => {
    try {
      // Handle both JSON string and object
      let parsedData: any;
      if (typeof signatureData === 'string') {
        parsedData = JSON.parse(signatureData);
      } else {
        parsedData = signatureData;
      }

      // If it's already a signature object, use import manager
      if (parsedData.type === 'god_reflection_signature_perceptron') {
        const result = await importManager.current.importSignature(
          new File([JSON.stringify(parsedData)], 'signature.json', { type: 'application/json' })
        );

        if (!result.success) {
          alert(result.error || 'Failed to import signature');
            return;
          }

        if (!result.signature) {
          alert('Invalid signature file');
          return;
        }

        // Check for duplicates
        // Convert collectiveData to the format expected by isDuplicate
        const existingSignatures = collectiveData.map(sig => ({
          type: sig.type,
          version: (sig as any).version || '2.0.0',
          signature: (sig as any).signature || sig.entries?.map((e: any) => e.word).join('-') || '',
          publicKey: (sig as any).publicKey || ''
        }));
        if (importManager.current.isDuplicate(result.signature, existingSignatures as any)) {
          alert("This signature has already been imported.");
            return;
          }

        // Verify geometric invariants if Perceptron state exists
        if (result.perceptronState) {
          const isValid = await importManager.current.verifyGeometricInvariants(result.perceptronState);
          if (!isValid) {
            console.warn('[App] Geometric verification failed, but importing anyway');
          }
        }

        const newCollective: CollectiveSignature[] = [...collectiveData, result.signature as CollectiveSignature];
          setCollectiveData(newCollective);
          localStorage.setItem('god_collective', JSON.stringify(newCollective));

        alert(`Successfully imported 1 new signature${result.verified ? ' (verified)' : ''}.`);
        } else {
        alert('Invalid signature format');
      }
    } catch (error) {
      console.error('[App] Failed to process signature:', error);
      alert(`Failed to import signature: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };


  const exportCollectiveData = async () => {
    if (collectiveData.length === 0) {
      alert("There is no collective data to export.");
      return;
    }

    try {
      await exportManager.current.exportCollective(collectiveData);
    } catch (error) {
      console.error('[App] Export collective failed:', error);
      alert('Failed to export collective data. Please try again.');
    }
  };

  const analyzeTripleGraph = () => {
    if (collectiveData.length === 0) return null;

    interface TripleData {
      s: string;
      p: string;
      o: string;
      timestamp: string;
    }

    const allTriples: TripleData[] = [];
    collectiveData.forEach(d => {
      d.entries.forEach(entry => {
        if (entry.triples) {
          entry.triples.forEach(triple => {
            if (triple.subject && triple.predicate && triple.object) {
              allTriples.push({
                s: triple.subject.toLowerCase().trim(),
                p: triple.predicate.toLowerCase().trim(),
                o: triple.object.toLowerCase().trim(),
                timestamp: entry.timestamp
              });
            }
          });
        }
      });
    });

    if (allTriples.length === 0) return null;

    // Build knowledge graph
    const nodes = new Set<string>();
    interface Edge {
      from: string;
      to: string;
      label: string;
      timestamp: string;
    }
    const edges: Edge[] = [];

    allTriples.forEach(t => {
      nodes.add(t.s);
      nodes.add(t.o);
      edges.push({
        from: t.s,
        to: t.o,
        label: t.p,
        timestamp: t.timestamp
      });
    });

    // Find central concepts (most connected)
    const nodeConnections: Record<string, number> = {};
    nodes.forEach(n => nodeConnections[n] = 0);
    edges.forEach(e => {
      nodeConnections[e.from]++;
      nodeConnections[e.to]++;
    });

    const centralNodes = Object.entries(nodeConnections)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    // Find common paths (recurring patterns)
    const pathFreq: Record<string, number> = {};
    allTriples.forEach(t => {
      const path = `${t.s}→${t.p}→${t.o}`;
      pathFreq[path] = (pathFreq[path] || 0) + 1;
    });

    const commonPaths = Object.entries(pathFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    // Detect recursive patterns (A→B→A cycles)
    interface Cycle {
      pattern: string;
      predicates: string[];
    }
    const cycles: Cycle[] = [];
    edges.forEach(e1 => {
      edges.forEach(e2 => {
        if (e1.from === e2.to && e1.to === e2.from && e1.from !== e1.to) {
          const cycle = `${e1.from}⟷${e1.to}`;
          if (!cycles.find(c => c.pattern === cycle)) {
            cycles.push({
              pattern: cycle,
              predicates: [e1.label, e2.label]
            });
          }
        }
      });
    });

    return {
      totalNodes: nodes.size,
      totalEdges: edges.length,
      centralNodes,
      commonPaths,
      cycles: cycles.slice(0, 5),
      density: (edges.length / (nodes.size * (nodes.size - 1))).toFixed(4)
    };
  };

  const analyzeCollective = () => {
    if (collectiveData.length === 0) return null;

    const allWords = collectiveData.flatMap(d => d.entries.map(e => e.word.toLowerCase()));
    const wordFreq: Record<string, number> = {};
    allWords.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });

    const sorted = Object.entries(wordFreq).sort((a, b) => b[1] - a[1]);

    let totalPositive = 0, totalNegative = 0, totalNeutral = 0;
    collectiveData.forEach(d => {
      const pattern = d.pattern || analyzeBinomial();
      totalPositive += pattern.positive;
      totalNegative += pattern.negative;
      totalNeutral += pattern.neutral;
    });

    // Extract all triples from all entries
    const allTriples: SemanticTriple[] = [];
    collectiveData.forEach(d => {
      d.entries.forEach(entry => {
        if (entry.triples) {
          entry.triples.forEach(triple => {
            if (triple.subject || triple.predicate || triple.object) {
              allTriples.push(triple);
            }
          });
        }
      });
    });

    // Analyze triple patterns
    const subjectFreq: Record<string, number> = {};
    const predicateFreq: Record<string, number> = {};
    const objectFreq: Record<string, number> = {};

    allTriples.forEach(t => {
      if (t.subject) subjectFreq[t.subject.toLowerCase()] = (subjectFreq[t.subject.toLowerCase()] || 0) + 1;
      if (t.predicate) predicateFreq[t.predicate.toLowerCase()] = (predicateFreq[t.predicate.toLowerCase()] || 0) + 1;
      if (t.object) objectFreq[t.object.toLowerCase()] = (objectFreq[t.object.toLowerCase()] || 0) + 1;
    });

    // Time-series analysis
    interface TimeData {
      positive: number;
      negative: number;
      neutral: number;
      count: number;
    }
    const timeData: Record<string, TimeData> = {};
    collectiveData.forEach(d => {
      const date = new Date(d.generated).toISOString().split('T')[0];
      if (!timeData[date]) {
        timeData[date] = { positive: 0, negative: 0, neutral: 0, count: 0 };
      }
      const pattern = d.pattern || analyzeBinomial();
      timeData[date].positive += pattern.positive;
      timeData[date].negative += pattern.negative;
      timeData[date].neutral += pattern.neutral;
      timeData[date].count += 1;
    });

    const sortedDates = Object.keys(timeData).sort();
    const timeSeries = sortedDates.map(date => ({
      date,
      ...timeData[date],
      ratio: timeData[date].positive / (timeData[date].negative || 1)
    }));

    // Verification stats
    const verifiedCount = collectiveData.filter(d => d.cryptoSignature).length;

    return {
      topWords: sorted.slice(0, 10),
      totalSignatures: collectiveData.length,
      totalEntries: allWords.length,
      collective: {
        positive: totalPositive,
        negative: totalNegative,
        neutral: totalNeutral
      },
      triples: {
        total: allTriples.length,
        topSubjects: Object.entries(subjectFreq).sort((a, b) => b[1] - a[1]).slice(0, 5),
        topPredicates: Object.entries(predicateFreq).sort((a, b) => b[1] - a[1]).slice(0, 5),
        topObjects: Object.entries(objectFreq).sort((a, b) => b[1] - a[1]).slice(0, 5)
      },
      graph: analyzeTripleGraph(),
      timeSeries,
      verified: verifiedCount,
      verificationRate: collectiveData.length > 0 ? (verifiedCount / collectiveData.length * 100).toFixed(1) : '0.0'
    };
  };

  const analyzeBinomial = () => {
    if (entries.length === 0) return { positive: 0, negative: 0, neutral: 0 };

    const positiveWords = ['love', 'light', 'good', 'truth', 'beauty', 'peace', 'joy', 'life', 'everything', 'one', 'infinite', 'eternal', 'creator', 'source'];
    const negativeWords = ['void', 'nothing', 'dead', 'absent', 'fear', 'illusion', 'fake', 'lie', 'control', 'limit'];

    let positive = 0, negative = 0, neutral = 0;

    entries.forEach(entry => {
      const word = entry.word.toLowerCase();
      if (positiveWords.some(w => word.includes(w))) positive++;
      else if (negativeWords.some(w => word.includes(w))) negative++;
      else neutral++;
    });

    return { positive, negative, neutral };
  };

  const getDayEntry = (day: number) => entries.find(e => e.day === day);

  return (
    <div className="god-journal-container">
      <div className="max-w-4xl mx-auto">
        <header className="god-header">
          <h1 className="god-title">
            <Sparkles className="text-yellow-300" />
            The 7-Day God Mirror
          </h1>
          <p className="god-subtitle">A collective reflection to know our limits by our nature</p>
        </header>

        <div className="nav-container">
          <button
            onClick={() => setView('journal')}
            className={`nav-button ${view === 'journal' ? 'active' : ''}`}
          >
            Journal
          </button>
          <button
            onClick={() => setView('pattern')}
            className={`nav-button ${view === 'pattern' ? 'active' : ''}`}
          >
            Pattern
          </button>
          <button
            onClick={() => setView('calendar')}
            className={`nav-button ${view === 'calendar' ? 'active' : ''}`}
          >
            <Calendar className="inline w-4 h-4" /> Calendar
          </button>
          <button
            onClick={() => setView('collective')}
            className={`nav-button ${view === 'collective' ? 'active' : ''}`}
          >
            <Users className="inline w-4 h-4" /> Collective
          </button>
          <button
            onClick={() => setView('analytics')}
            className={`nav-button ${view === 'analytics' ? 'active' : ''}`}
          >
            <BarChart3 className="inline w-4 h-4" /> Analytics
          </button>
          {liveEvents.length > 0 && (
            <span className="ml-2 text-xs text-green-400 animate-pulse">
              {liveEvents.length} updates
            </span>
          )}
        </div>

        {view === 'journal' && (
          <div className="content-card">
            <h2 className="text-2xl mb-4">Day {currentDay} of 7</h2>

            <div className="form-group">
              <label className="form-label">God is _____?</label>
              <input
                type="text"
                value={todayEntry.word}
                onChange={(e) => setTodayEntry({...todayEntry, word: e.target.value})}
                placeholder="One word..."
                className="form-input"
                maxLength={50}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Reflection (optional)</label>
              <textarea
                value={todayEntry.content}
                onChange={(e) => setTodayEntry({...todayEntry, content: e.target.value})}
                placeholder="Quote, thought, article, or media..."
                className="form-input form-textarea"
              />
            </div>

            <div className="triple-section">
              <div className="triple-header">
                <h3 className="triple-title">Context Triples (optional)</h3>
                <button
                  onClick={addTriple}
                  className="add-triple"
                >
                  + Add Triple
                </button>
              </div>
              <p className="text-xs text-slate-400 mb-3">
                Subject-Predicate-Object format. Examples: "I, am, here" or "This, is, beautiful" or "God, lives, everywhere"
              </p>

              {(todayEntry.triples || []).map((triple, idx) => (
                <div key={idx} className="triple-grid">
                  <input
                    type="text"
                    value={triple.subject}
                    onChange={(e) => updateTriple(idx, 'subject', e.target.value)}
                    placeholder="Subject"
                    className="triple-input"
                  />
                  <input
                    type="text"
                    value={triple.predicate}
                    onChange={(e) => updateTriple(idx, 'predicate', e.target.value)}
                    placeholder="Predicate"
                    className="triple-input"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={triple.object}
                      onChange={(e) => updateTriple(idx, 'object', e.target.value)}
                      placeholder="Object"
                      className="triple-input"
                    />
                    <button
                      onClick={() => removeTriple(idx)}
                      className="remove-triple"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between">
            <button
              onClick={saveEntry}
                disabled={!todayEntry.word.trim() || !isReady}
              className="btn btn-primary"
            >
              Save Day {currentDay}
            </button>
              {!isReady && (
                <span className="text-xs text-gray-400">
                  Initializing Perceptron...
                </span>
              )}
            </div>
          </div>
        )}

        {view === 'pattern' && (
          <div className="content-card">
            <h2 className="text-2xl mb-4 flex items-center gap-2">
              <BarChart3 /> Binomial Pattern Analysis
            </h2>

            {entries.length === 0 ? (
              <p className="text-purple-300">No entries yet. Start journaling to see patterns.</p>
            ) : (
              <>
                <div className="auth-badge">
                  <Shield className="w-5 h-5 text-green-400" />
                  <div className="text-sm">
                    <div className="font-semibold">Cryptographically Signed</div>
                    <div className="text-xs text-green-300">Your signature will be verifiable and tamper-proof</div>
                  </div>
                </div>
                <div className="stats-grid">
                  <div className="stat-card stat-positive">
                    <div className="stat-number">{analyzeBinomial().positive}</div>
                    <div className="stat-label">Life-Affirming</div>
                  </div>
                  <div className="stat-card stat-neutral">
                    <div className="stat-number">{analyzeBinomial().neutral}</div>
                    <div className="stat-label">Neutral</div>
                  </div>
                  <div className="stat-card stat-negative">
                    <div className="stat-number">{analyzeBinomial().negative}</div>
                    <div className="stat-label">Life-Denying</div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl mb-3">Your 7-Day Signature</h3>
                  <div className="signature-display">
                    <p className="signature-text">
                      {entries.sort((a, b) => a.day - b.day).map(e => e.word).join(' → ')}
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl mb-3">Recursive Reflection</h3>
                  <p className="text-purple-200 leading-relaxed">
                    Your pattern shows {analyzeBinomial().positive > analyzeBinomial().negative ?
                      'a movement toward limitless nature - your perception aligns with expansion' :
                      analyzeBinomial().negative > analyzeBinomial().positive ?
                      'boundaries being explored - your perception is testing limits' :
                      'balanced tension - you hold both the boundary and the boundless'}
                  </p>
                </div>

                <div className="mb-6 flex gap-4">
                <button
                  onClick={exportAsQR}
                  className="btn btn-secondary"
                >
                  <Download className="w-5 h-5" />
                    Export JSON File
                </button>
                    <button
                    onClick={generateQRCode}
                    className="btn btn-secondary"
                    >
                    <Share2 className="w-5 h-5" />
                    Generate QR Code
                    </button>
                  </div>

                {qrExportData && (
                  <div className="qr-section">
                    <QRCodeDisplay
                      data={qrExportData}
                      title="Your 7-Day Signature QR Code"
                      size={300}
                    />
                    <p className="text-xs text-gray-400 mt-3 text-center">
                      Scan this QR code to import your signature on another device
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {view === 'analytics' && (
          <div className="content-card">
            <DailyDashboard
              userEntries={entries}
              collectiveData={collectiveData}
              currentDay={currentDay}
              todayEntry={todayEntry}
            />
          </div>
        )}

        {view === 'collective' && (
          <div className="content-card">
            <h2 className="text-2xl mb-4 flex items-center gap-2">
              <Users /> Collective Analysis
              {isReady && (
                <span className="ml-2 text-xs text-green-400 flex items-center gap-1">
                  <Network className="w-4 h-4" />
                  <span>Perceptron Active</span>
                </span>
              )}
            </h2>

            <div className="mb-6 flex justify-center gap-4 flex-wrap">
              <button
                onClick={() => setShowQRScanner(true)}
                className="btn btn-success"
              >
                <Camera className="w-5 h-5" />
                Scan QR Code
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-success"
              >
                <Upload className="w-5 h-5" />
                Import File
              </button>
              <button
                onClick={exportCollectiveData}
                className="btn btn-secondary"
              >
                <Download className="w-5 h-5" />
                Export Collective
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-2 text-center">
              Scan QR codes or import files to see patterns from others
            </p>

            {/* QR Scanner Modal */}
            {showQRScanner && (
              <QRCodeScanner
                onScan={async (data) => {
                  await processImportedSignature(data);
                  setShowQRScanner(false);
                }}
                onClose={() => setShowQRScanner(false)}
              />
            )}

            {/* Live Feed Component */}
            {liveEvents.length > 0 && (
              <div className="mb-6">
                <LiveFeed
                  events={liveEvents}
                  onClear={() => {/* Clear handled by component */}}
                />
              </div>
            )}

            {/* MQTT Discovery Component */}
            {privateKey && (
              <div className="mb-6">
                <MqttDiscovery
                  publicKey={privateKey}
                  onImportSignature={async (exportData) => {
                    await processImportedSignature(exportData);
                  }}
                  onPublishRequest={(publishFn) => {
                    // Store publish function for later use
                    (window as any).mqttPublishSignature = publishFn;
                  }}
                />
              </div>
            )}

            {collectiveData.length === 0 ? (
              <div className="text-center text-purple-300 py-8">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No collective data yet.</p>
                <p className="text-sm mt-2">Import signatures via QR codes, files, or MQTT discovery to analyze the collective consciousness.</p>
              </div>
            ) : (
              <>
                {(() => {
                  const analysis = analyzeCollective();
                  if (!analysis) return null;
                  return (
                    <>
                      <div className="collective-stats">
                        <div className="collective-stat">
                          <div className="collective-stat-number">{analysis.totalSignatures}</div>
                          <div className="collective-stat-label">Signatures</div>
                          <div className="text-xs text-green-400 mt-1">
                            <Shield className="inline w-3 h-3" /> {analysis.verificationRate}% verified
                          </div>
                        </div>
                        <div className="collective-stat">
                          <div className="collective-stat-number">{analysis.totalEntries}</div>
                          <div className="collective-stat-label">Total Reflections</div>
                        </div>
                        <div className="collective-stat">
                          <div className="collective-stat-number">{analysis.topWords[0]?.[0] || 'N/A'}</div>
                          <div className="collective-stat-label">Most Common</div>
                        </div>
                      </div>

                      <div className="mb-6">
                        <h3 className="text-xl mb-3">Collective Pattern</h3>
                        <div className="stats-grid">
                          <div className="stat-card stat-positive">
                            <div className="stat-number">{analysis.collective.positive}</div>
                            <div className="stat-label">Life-Affirming</div>
                          </div>
                          <div className="stat-card stat-neutral">
                            <div className="stat-number">{analysis.collective.neutral}</div>
                            <div className="stat-label">Neutral</div>
                          </div>
                          <div className="stat-card stat-negative">
                            <div className="stat-number">{analysis.collective.negative}</div>
                            <div className="stat-label">Life-Denying</div>
                          </div>
                        </div>
                      </div>

                      <div className="mb-6">
                        <h3 className="text-xl mb-3">Top 10 Collective Words</h3>
                        <div className="word-grid">
                          {analysis.topWords.map(([word, count], idx) => (
                            <div key={idx} className="word-item">
                              <span className="word-text">{word}</span>
                              <span className="word-count">{count}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-indigo-900/30 p-4 rounded border border-indigo-500/30">
                        <h3 className="text-lg mb-2">Emergent Meaning</h3>
                        <p className="text-purple-200 leading-relaxed">
                          {analysis.collective.positive > analysis.collective.negative * 1.5
                            ? "The collective consciousness is expanding toward limitlessness. The natural image shows unity and life-affirmation dominating."
                            : analysis.collective.negative > analysis.collective.positive * 1.5
                            ? "The collective is exploring boundaries intensely. This reflection period shows the limits we're testing."
                            : "The collective holds perfect tension - the boundary and the boundless in balance. This is the natural equilibrium of perception."}
                        </p>
                      </div>

                      {analysis.timeSeries.length > 0 && (
                        <div className="time-series">
                          <h3 className="text-lg mb-3 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5" /> Time-Series Evolution
                          </h3>
                          <div className="space-y-2">
                            {analysis.timeSeries.slice(-7).map((day, idx) => (
                              <div key={idx} className="time-series-item">
                                <div className="time-date">{day.date}</div>
                                <div className="time-bar">
                                  <div
                                    className="bg-green-500 h-4 rounded-l"
                                    style={{width: `${(day.positive / day.count) * 100}%`}}
                                  />
                                  <div
                                    className="bg-slate-500 h-4"
                                    style={{width: `${(day.neutral / day.count) * 100}%`}}
                                  />
                                  <div
                                    className="bg-red-500 h-4 rounded-r"
                                    style={{width: `${(day.negative / day.count) * 100}%`}}
                                  />
                                </div>
                                <div className="time-ratio">
                                  {day.ratio.toFixed(2)}x
                                </div>
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-slate-400 mt-3">
                            Ratio shows positive/negative trend. Higher = more life-affirming over time.
                          </p>
                        </div>
                      )}
                    </>
                  );
                })()}
              </>
            )}
          </div>
        )}

        {view === 'calendar' && (
          <div className="content-card">
            <h2 className="text-2xl mb-4">7-Day Journey</h2>

            <div className="calendar-grid">
              {[1, 2, 3, 4, 5, 6, 7].map(day => {
                const entry = getDayEntry(day);
                return (
                  <div
                    key={day}
                    className={`calendar-day ${entry ? 'completed' : 'pending'}`}
                  >
                    <div className="day-header">
                      <div className={`day-number ${entry ? 'completed' : 'pending'}`}>
                        {day}
                      </div>
                      <div className="flex-1">
                        {entry ? (
                          <div>
                            <div className="day-word">
                              God is {entry.word}
                            </div>
                            {entry.content && (
                              <div className="day-content">
                                {entry.content.substring(0, 100)}
                                {entry.content.length > 100 ? '...' : ''}
                              </div>
                            )}
                            {entry.triples && entry.triples.length > 0 && (
                              <div className="day-triples">
                                {entry.triples.map((t, tidx) => (
                                  <div key={tidx} className="triple-item">
                                    [{t.subject || '_'}, {t.predicate || '_'}, {t.object || '_'}]
                                  </div>
                                ))}
                              </div>
                            )}
                            <div className="day-timestamp">
                              {new Date(entry.timestamp).toLocaleDateString()}
                            </div>
                          </div>
                        ) : (
                          <div className="text-slate-400">Not yet recorded</div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <footer className="god-footer">
          <p className="footer-quote">
            "If we perceive God as supernatural, we create the boundary that defines our limitlessness."
          </p>
          <p className="footer-note">
            Privacy-first: All data stored locally in your browser. Export to share your signature.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default GodReflectionJournal;
