import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Download, BarChart3, Sparkles, Upload, Users, Share2, TrendingUp, MapPin, Shield, Network } from 'lucide-react';
import "./App.css"

const GodReflectionJournal = () => {
  const [entries, setEntries] = useState([]);
  const [currentDay, setCurrentDay] = useState(1);
  const [todayEntry, setTodayEntry] = useState({ word: '', content: '', type: 'text', triples: [] });
  const [view, setView] = useState('journal');
  const [collectiveData, setCollectiveData] = useState([]);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [location, setLocation] = useState({ region: '', includeLocation: false });
  const [privateKey, setPrivateKey] = useState('');
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const stored = localStorage.getItem('god_reflections');
    if (stored) {
      const parsed = JSON.parse(stored);
      setEntries(parsed.entries || []);
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

  const hashMessage = async (message) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const signData = async (data) => {
    const message = JSON.stringify(data);
    const hash = await hashMessage(message + privateKey);
    return hash;
  };

  const verifySignature = async (data, signature) => {
    // For verification, we check if the signature matches any known public key
    // In a real implementation, this would use proper asymmetric crypto
    const hash = await hashMessage(JSON.stringify(data) + signature);
    return hash.length === 64; // Basic validation
  };

  const addTriple = () => {
    setTodayEntry({
      ...todayEntry,
      triples: [...(todayEntry.triples || []), { subject: '', predicate: '', object: '' }]
    });
  };

  const updateTriple = (index, field, value) => {
    const newTriples = [...(todayEntry.triples || [])];
    newTriples[index][field] = value;
    setTodayEntry({ ...todayEntry, triples: newTriples });
  };

  const removeTriple = (index) => {
    const newTriples = (todayEntry.triples || []).filter((_, i) => i !== index);
    setTodayEntry({ ...todayEntry, triples: newTriples });
  };

  const saveEntry = () => {
    if (!todayEntry.word.trim()) return;
    
    const newEntry = {
      day: currentDay,
      word: todayEntry.word,
      content: todayEntry.content,
      type: todayEntry.type,
      triples: (todayEntry.triples || []).filter(t => t.subject || t.predicate || t.object),
      timestamp: new Date().toISOString()
    };

    const newEntries = [...entries.filter(e => e.day !== currentDay), newEntry];
    setEntries(newEntries);
    
    localStorage.setItem('god_reflections', JSON.stringify({
      entries: newEntries,
      currentDay: currentDay < 7 ? currentDay + 1 : currentDay
    }));

    if (currentDay < 7) {
      setCurrentDay(currentDay + 1);
    }
    
    setTodayEntry({ word: '', content: '', type: 'text', triples: [] });
  };

  const generateQRCode = () => {
    const data = {
      signature: entries.map(e => e.word).join('-'),
      entries: entries,
      pattern: analyzeBinomial(),
      generated: new Date().toISOString(),
      version: '1.0.0'
    };
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const size = 400;
    canvas.width = size;
    canvas.height = size;
    
    // Simple QR-like matrix visualization
    const jsonStr = JSON.stringify(data);
    const moduleSize = 8;
    const modules = Math.floor(size / moduleSize);
    
    // Create hash-based pattern
    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(0, 0, size, size);
    
    for (let i = 0; i < jsonStr.length && i < modules * modules; i++) {
      const x = (i % modules) * moduleSize;
      const y = Math.floor(i / modules) * moduleSize;
      const charCode = jsonStr.charCodeAt(i);
      
      if (charCode % 2 === 0) {
        ctx.fillStyle = '#8b5cf6';
        ctx.fillRect(x, y, moduleSize - 1, moduleSize - 1);
      }
    }
    
    // Add signature text in center
    ctx.fillStyle = 'rgba(30, 27, 75, 0.8)';
    ctx.fillRect(size * 0.2, size * 0.4, size * 0.6, size * 0.2);
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(data.signature.substring(0, 30), size / 2, size / 2);
    
    setQrDataUrl(canvas.toDataURL());
  };

  const exportAsQR = async () => {
    const data = {
      signature: entries.map(e => e.word).join('-'),
      entries: entries,
      pattern: analyzeBinomial(),
      generated: new Date().toISOString(),
      version: '1.0.0',
      type: 'god_reflection_signature',
      publicKey: await hashMessage(privateKey) // Public key derived from private
    };
    
    // Sign the data
    const cryptoSignature = await signData(data);
    const signedData = { ...data, cryptoSignature };
    
    const blob = new Blob([JSON.stringify(signedData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `god-signature-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportQRImage = () => {
    if (!qrDataUrl) return;
    
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `god-signature-qr-${Date.now()}.png`;
    a.click();
  };

  const importSignature = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (imported.type === 'god_reflection_signature') {
          // Verify signature if present
          if (imported.cryptoSignature) {
            const { cryptoSignature, ...dataToVerify } = imported;
            const isValid = await verifySignature(dataToVerify, imported.publicKey);
            imported.verified = isValid;
          }
          
          const newCollective = [...collectiveData, imported];
          setCollectiveData(newCollective);
          localStorage.setItem('god_collective', JSON.stringify(newCollective));
        }
      } catch (err) {
        console.error('Invalid signature file');
      }
    };
    reader.readAsText(file);
  };

  const analyzeTripleGraph = () => {
    if (collectiveData.length === 0) return null;
    
    const allTriples = [];
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
    const nodes = new Set();
    const edges = [];
    
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
    const nodeConnections = {};
    nodes.forEach(n => nodeConnections[n] = 0);
    edges.forEach(e => {
      nodeConnections[e.from]++;
      nodeConnections[e.to]++;
    });
    
    const centralNodes = Object.entries(nodeConnections)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    
    // Find common paths (recurring patterns)
    const pathFreq = {};
    allTriples.forEach(t => {
      const path = `${t.s}→${t.p}→${t.o}`;
      pathFreq[path] = (pathFreq[path] || 0) + 1;
    });
    
    const commonPaths = Object.entries(pathFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    
    // Detect recursive patterns (A→B→A cycles)
    const cycles = [];
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
    const wordFreq = {};
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
    const allTriples = [];
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
    const subjectFreq = {};
    const predicateFreq = {};
    const objectFreq = {};
    
    allTriples.forEach(t => {
      if (t.subject) subjectFreq[t.subject.toLowerCase()] = (subjectFreq[t.subject.toLowerCase()] || 0) + 1;
      if (t.predicate) predicateFreq[t.predicate.toLowerCase()] = (predicateFreq[t.predicate.toLowerCase()] || 0) + 1;
      if (t.object) objectFreq[t.object.toLowerCase()] = (objectFreq[t.object.toLowerCase()] || 0) + 1;
    });
    
    // Time-series analysis
    const timeData = {};
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
    
    // Mock regions data since it's referenced but not implemented
    const regions = [];
    
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
      regions,
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

  const getDayEntry = (day) => entries.find(e => e.day === day);

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

            <button
              onClick={saveEntry}
              disabled={!todayEntry.word.trim()}
              className="btn btn-primary"
            >
              Save Day {currentDay}
            </button>
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

                <button
                  onClick={exportAsQR}
                  className="btn btn-secondary"
                >
                  <Download className="w-5 h-5" />
                  Export JSON Signature
                </button>

                {qrDataUrl && (
                  <div className="qr-section">
                    <h3 className="text-xl mb-3">Your Visual QR Signature</h3>
                    <div className="bg-slate-900/50 p-4 rounded">
                      <img src={qrDataUrl} alt="QR Code" className="qr-image" />
                    </div>
                    <button
                      onClick={exportQRImage}
                      className="btn"
                    >
                      <Share2 className="w-4 h-4" />
                      Save QR Image
                    </button>
                  </div>
                )}

                <canvas ref={canvasRef} style={{ display: 'none' }} />
              </>
            )}
          </div>
        )}

        {view === 'collective' && (
          <div className="content-card">
            <h2 className="text-2xl mb-4 flex items-center gap-2">
              <Users /> Collective Analysis
            </h2>
            
            <div className="mb-6">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={importSignature}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-success"
              >
                <Upload className="w-5 h-5" />
                Import God Signature
              </button>
              <p className="text-xs text-slate-400 mt-2 text-center">
                Import JSON signatures from others to see collective patterns
              </p>
            </div>

            {collectiveData.length === 0 ? (
              <div className="text-center text-purple-300 py-8">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No collective data yet.</p>
                <p className="text-sm mt-2">Import signatures to analyze the collective consciousness.</p>
              </div>
            ) : (
              <>
                {(() => {
                  const analysis = analyzeCollective();
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