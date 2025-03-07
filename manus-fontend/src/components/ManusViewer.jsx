import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

// Typing effect component
const TypeWriter = ({ text, speed = 10, onComplete }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (currentIndex < text?.length) {
      intervalRef.current = setInterval(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prevIndex => prevIndex + 1);
      }, speed);
    } else if (onComplete) {
      onComplete();
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [currentIndex, text, speed, onComplete]);

  useEffect(() => {
    // Reset when text changes
    setDisplayText('');
    setCurrentIndex(0);
  }, [text]);

  return <span>{displayText}</span>;
};

// Terminal output component
const TerminalOutput = ({ output }) => {
  return (
    <div className="terminal-output">
      <pre>
        {output?.map((line, index) => (
          <div key={index}>
            <TypeWriter text={line} />
          </div>
        ))}
      </pre>
    </div>
  );
};

// Browser screenshot component
const BrowserScreenshot = ({ screenshot }) => {
  return (
    <div className="browser-screenshot">
      <img src={screenshot} alt="Browser Screenshot" />
    </div>
  );
};

// Markdown content component
const MarkdownContent = ({ content }) => {
  const [isTyped, setIsTyped] = useState(false);
  const [displayContent, setDisplayContent] = useState('');

  return (
    <div className="markdown-content">
      {!isTyped ? (
        <TypeWriter 
          text={content} 
          speed={5} 
          onComplete={() => {
            setIsTyped(true);
            setDisplayContent(content);
          }} 
        />
      ) : (
        <ReactMarkdown>{displayContent}</ReactMarkdown>
      )}
    </div>
  );
};

// Detail panel component
const DetailPanel = ({ detail }) => {
  if (!detail) return null;

  return (
    <div className="detail-panel-content">
      {detail.terminal && (
        <div className="terminal-container">
          <h3>Terminal Output</h3>
          <TerminalOutput output={detail.terminal.output || []} />
        </div>
      )}
      
      {detail.browser && detail.browser.screenshot && (
        <div className="browser-container">
          <h3>Browser Screenshot</h3>
          <BrowserScreenshot screenshot={detail.browser.screenshot} />
        </div>
      )}
      
      {detail.textEditor && (
        <div className="text-editor-container">
          <h3>Text Editor: {detail.textEditor.path}</h3>
          <MarkdownContent content={detail.textEditor.content || ''} />
        </div>
      )}
      
      {detail.search && (
        <div className="search-container">
          <h3>Search Results</h3>
          <div className="search-queries">
            <strong>Queries:</strong> <TypeWriter text={detail.search.queries?.join(', ')} />
          </div>
          <div className="search-results">
            {detail.search.results?.map((result, index) => (
              <div key={index} className="search-result">
                <h4>
                  <TypeWriter text={result.title} />
                </h4>
                <a href={result.link}>
                  <TypeWriter text={result.link} />
                </a>
                <p>
                  <TypeWriter text={result.snippet} />
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Task component
const Task = ({ task }) => {
  return (
    <div className="task-item">
      <span className={`task-status ${task.status}`}>
        {task.status === 'done' ? '✓' : task.status === 'doing' ? '⟳' : '○'}
      </span>
      <span className="task-title">
        <TypeWriter text={task.title} />
      </span>
    </div>
  );
};

// Node component
const Node = ({ node, onSelectDetail }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  useEffect(() => {
    if (node.detail && onSelectDetail) {
      onSelectDetail(node.detail);
    }
  }, [node, onSelectDetail]);

  // 显示节点内容
  const renderNodeContent = () => {
    // 根据节点类型显示不同的内容
    if (node.type === 'chat') {
      return (
        <div className="chat-content">
          <div className="chat-sender">{node.sender === 'assistant' ? 'Manus' : '您'}</div>
          <div className="chat-message">
            <TypeWriter text={node.content || ''} />
          </div>
        </div>
      );
    }
    
    return (
      <div className="node-content-wrapper">
        <span className="node-type">
          <TypeWriter text={node.type || 'Unknown'} />
        </span>
        
        {node.brief && (
          <span className="node-brief">
            <TypeWriter text={node.brief} />
          </span>
        )}
        
        {node.description && (
          <span className="node-description">
            <TypeWriter text={node.description} />
          </span>
        )}
        
        {node.text && (
          <span className="node-text">
            <TypeWriter text={node.text} />
          </span>
        )}
        
        {node.content && node.type !== 'chat' && (
          <span className="node-content">
            <TypeWriter text={node.content} />
          </span>
        )}
      </div>
    );
  };

  return (
    <div className={`node ${node.type === 'chat' ? 'chat-node' : ''} ${node.sender === 'assistant' ? 'assistant-node' : 'user-node'}`}>
      <div 
        className={`node-header ${node.detail ? 'has-detail' : ''}`} 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {node.tasks && (
          <span className="expand-icon">{isExpanded ? '▼' : '►'}</span>
        )}
        {renderNodeContent()}
      </div>
      
      {node.tasks && isExpanded && (
        <div className="tasks-container">
          {node.tasks.map((task, index) => (
            <Task key={index} task={task} />
          ))}
        </div>
      )}
    </div>
  );
};

// Header component
const Header = ({ title }) => {
  return (
    <div className="manus-header">
      <div className="manus-logo">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="#333"/>
          <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" fill="#333"/>
        </svg>
        <span>manus</span>
      </div>
      <div className="manus-title">{title}</div>
      <div className="manus-actions">
        <button className="login-button">登录</button>
      </div>
    </div>
  );
};

// Main component
const ManusViewer = ({ data }) => {
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [visibleNodeCount, setVisibleNodeCount] = useState(1);
  const nodesPanelRef = useRef(null);
  
  // 逐步显示节点
  useEffect(() => {
    if (!data || data.length === 0) return;
    
    // 每隔一段时间显示下一个节点
    const interval = setInterval(() => {
      setVisibleNodeCount(prev => {
        if (prev < data.length) {
          return prev + 1;
        } else {
          clearInterval(interval);
          return prev;
        }
      });
    }, 200); // 每0.05秒显示一个新节点
    
    return () => clearInterval(interval);
  }, [data]);
  
  // 自动滚动到底部
  useEffect(() => {
    if (nodesPanelRef.current) {
      nodesPanelRef.current.scrollTop = nodesPanelRef.current.scrollHeight;
    }
  }, [visibleNodeCount]);
  
  // 如果没有数据，显示加载中
  if (!data || data.length === 0) {
    return <div>Loading...</div>;
  }

  // 提取标题（从第一个chat节点）
  const title = data.find(node => node.type === 'chat')?.content?.split('\n')[0] || '收盘同花顺点评及策略总结';

  return (
    <div className="manus-container">
      <Header title={title} />
      <div className="manus-viewer">
        <div className="nodes-panel" ref={nodesPanelRef}>
          <div className="manus-avatar-container">
            <div className="manus-avatar">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="#1E88E5"/>
                <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z" fill="#1E88E5"/>
              </svg>
              <span>Manus</span>
            </div>
            <div className="manus-intro">
              <p>您好！我已收到您的请求，我将帮您完成以下任务：</p>
              <ol>
                <li>收集同花顺的收盘点评作为参考</li>
                <li>做出今日榜单总结</li>
                <li>列出明天板块方向</li>
                <li>做出短线策略</li>
                <li>完成一套A股股神秘籍，用于公众号参考</li>
              </ol>
              <p>我会立即开始收集相关信息并为您准备这些内容。请稍等片刻，我将分步骤完成这项工作。</p>
            </div>
          </div>
          {data.slice(0, visibleNodeCount).map((node, index) => (
            <Node 
              key={node.id || index} 
              node={node} 
              onSelectDetail={setSelectedDetail} 
            />
          ))}
        </div>
        
        <div className="detail-panel">
          {selectedDetail ? (
            <DetailPanel detail={selectedDetail} />
          ) : (
            <div className="search-panel">
              <div className="search-header">
                <h2>Manus 的电脑</h2>
                <div className="search-input-container">
                  <input type="text" placeholder="Search" className="search-input" />
                  <button className="search-button">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="#666"/>
                    </svg>
                  </button>
                </div>
              </div>
              <div className="search-results-container">
                <div className="search-tabs">
                  <button className="tab active">正在搜索</button>
                  <button className="tab">同花顺</button>
                  <button className="tab">收盘点评</button>
                  <button className="tab">最新</button>
                </div>
                <div className="search-results">
                  {/* 搜索结果内容 */}
                  <div className="search-result-item">
                    <h3>手机同花顺财经__让投资变得更简单</h3>
                    <p>核新同花顺网络信息股份有限公司（同花顺）成立于1995年,是一家专业的互联网金融数据服务商,为您全方位提供财经资讯及全球金融市场行情,覆盖股票、基金、期货、外汇、...</p>
                  </div>
                  <div className="search-result-item">
                    <h3>大盘分析_股票_同花顺财经</h3>
                    <p>截至收盘，沪指涨0.53%报3341.96点，深证成指涨0.28%报10709.46点，创业板指涨 ... 最新调查结果编制而成，也称"褐皮书"。报告显示，自1月中旬以来，整体经济活动 ...</p>
                  </div>
                  <div className="search-result-item">
                    <h3>实时解盘_股票_同花顺财经</h3>
                    <p>实时解盘_股票_同花顺财经 港股午评：恒生指数涨2.64%，恒生科技指数涨4.72% 03月06日12:00 港股午间收盘，恒生指数涨2.64%突破24000点再创阶段新高，恒生科技指数涨4.72%...</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="manus-footer">
        <div className="progress-container">
          <div className="progress-indicator">
            <span className="progress-dot active"></span>
            <span className="progress-dot"></span>
            <span className="progress-dot"></span>
            <span className="progress-dot"></span>
            <span className="progress-dot"></span>
            <span className="progress-dot"></span>
            <span className="progress-dot"></span>
          </div>
          <div className="progress-text">
            <span>Manus 正在工作: 搜索同花顺市场收盘点评</span>
            <span className="progress-fraction">1/7</span>
          </div>
        </div>
        <div className="playback-controls">
          <button className="control-button">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" fill="#666"/>
            </svg>
          </button>
          <div className="playback-slider">
            <div className="slider-track">
              <div className="slider-fill" style={{ width: '15%' }}></div>
            </div>
          </div>
          <div className="playback-time">0:00</div>
        </div>
      </div>
    </div>
  );
};

export default ManusViewer; 