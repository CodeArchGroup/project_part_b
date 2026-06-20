import React, { useState } from 'react';

const ARTICLES = [
  {
    id: 'riba',
    title: 'Understanding Riba (Interest) & Debt',
    category: 'Core Principles',
    icon: '🛑',
    summary: 'Riba refers to exploitative gains made in trade or business under Islamic law. It is most commonly identified with interest on loans.',
    content: `Riba literally means "increase," "addition," or "growth." In Islamic finance, it refers to unequal exchanges or charging interest on loans. Under Shariah law, money is not an asset that has intrinsic value; it is merely a medium of exchange. Therefore, lending money to make more money (interest) is strictly prohibited (Haram).

### Why is Riba Haram?
The prohibition of Riba is designed to prevent exploitation of the needy and to ensure that wealth is generated through actual economic activity and risk-sharing, rather than simply hoarding and lending capital at a guaranteed return.

### Halal Alternatives
Instead of interest-bearing loans, Islamic finance utilizes:
- **Murabaha (Cost-plus sale)**: The financier purchases the asset and sells it to the client with an agreed-upon profit margin paid in installments.
- **Musharaka (Partnership)**: A joint venture where profits and losses are shared based on mutual agreements.
- **Qard Hasan (Benevolent Loan)**: An interest-free loan given for welfare purposes.`
  },
  {
    id: 'zakat',
    title: 'The Rules & Calculation of Zakat',
    category: 'Obligations',
    icon: '🤲',
    summary: 'Zakat is the third pillar of Islam, requiring Muslims to give 2.5% of their qualifying wealth annually to support the needy.',
    content: `Zakat is a compulsory charitable payment required from every Muslim whose net wealth exceeds the Nisab threshold for a full lunar year (Hawl). 

### Key Rules
1. **Qualifying Wealth**: Zakat is payable on cash, gold, silver, shares/investments, and business merchandise. It is NOT payable on personal items like your primary home, car, or clothing.
2. **Nisab Threshold**: The minimum amount of wealth one must hold to be liable for Zakat. It is equivalent to 85 grams of pure gold or 595 grams of pure silver.
3. **Calculation**: The standard rate is 2.5% (or 1/40th) of the total qualifying wealth.

### The Purpose of Zakat
Zakat purifies one's wealth and fosters social solidarity by directly supporting the poorest categories of society (as outlined in Surah At-Tawbah, 9:60). It ensures wealth circulates within the economy rather than accumulating in the hands of a few.`
  },
  {
    id: 'sukuk',
    title: 'Sukuk: Shariah-Compliant Investment',
    category: 'Investments',
    icon: '📜',
    summary: 'Learn how Sukuk (Islamic bonds) represent fractional ownership of tangible assets rather than interest-bearing debt.',
    content: `Unlike conventional bonds which are interest-bearing debt securities, Sukuk are investment certificates representing ownership shares in tangible assets, services, or projects.

### The Problem with Conventional Bonds
Conventional bonds are essentially loans. The issuer owes the bondholders a debt, and pays them guaranteed interest over time. This guaranteed return without risk-sharing is Riba.

### How Sukuk Works
When you purchase a Sukuk, you are actually buying a partial ownership stake in an underlying asset (like real estate or infrastructure). Your return is generated from the actual profit or rental income produced by that asset.

### Key Differences
- **Bonds**: The issuer owes bondholders debt with interest. Returns are guaranteed regardless of performance.
- **Sukuk**: The Sukuk holder owns a share of the underlying asset. Returns are tied to the actual performance and profit/loss of that asset, making it a risk-sharing investment rather than an interest-based loan.`
  },
  {
    id: 'gharar',
    title: 'Gharar & Maysir (Uncertainty & Gambling)',
    category: 'Core Principles',
    icon: '🎲',
    summary: 'Shariah prohibits transactions involving excessive risk, ambiguity, or games of chance to ensure transparency and fairness.',
    content: `Islamic finance emphasizes transparency, fairness, and the protection of all parties in a contract. Therefore, two elements are strictly forbidden alongside Riba:

### Gharar (Excessive Uncertainty)
Gharar prohibits transactions with high ambiguity regarding the subject matter, price, or delivery. 
- **Examples**: Selling fish still in the sea, crops before they harvest, or "mystery boxes." 
- **Modern Finance**: Many complex derivatives, short-selling, and speculative contracts fall under Gharar because they involve selling something you do not own or cannot guarantee delivery of.

### Maysir (Gambling)
Maysir prohibits wealth accumulation based on pure chance rather than productive work. 
- **Modern Finance**: Conventional options trading and highly speculative day-trading often fall under this category because they involve betting on price fluctuations rather than investing in underlying economic value.

*Note: Minor uncertainty (Gharar Yasir) is sometimes tolerated if it is unavoidable and standard in customary trade, but excessive uncertainty (Gharar Fahish) invalidates a contract.*`
  }
];

export default function Education() {
  const [selectedArticle, setSelectedArticle] = useState(ARTICLES[0]);
  const [isFading, setIsFading] = useState(false);

  const handleSelect = (article) => {
    if (article.id === selectedArticle.id) return;
    setIsFading(true);
    setTimeout(() => {
      setSelectedArticle(article);
      setIsFading(false);
    }, 200);
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', animation: 'authFadeIn 0.5s ease-out' }}>
      
      {/* Header */}
      <div style={{ 
        marginBottom: '40px', 
        background: 'linear-gradient(135deg, var(--surface) 0%, rgba(14, 116, 144, 0.05) 100%)', 
        padding: '40px', 
        borderRadius: '24px', 
        border: '1px solid var(--glass-border)',
        boxShadow: 'var(--glass-shadow)',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
        <h1 style={{ fontSize: '36px', marginBottom: '16px', background: 'linear-gradient(90deg, var(--primary-color), #38BDF8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Islamic Finance Masterclass
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '16px', maxWidth: '700px', margin: '0 auto', lineHeight: '1.6' }}>
          Empower yourself with authentic knowledge. Explore fundamental concepts of Shariah compliance, wealth management, and ethical investments to make informed financial decisions.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '40px', alignItems: 'start' }}>
        
        {/* Navigation Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'sticky', top: '40px' }}>
          <h3 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '8px', paddingLeft: '12px' }}>
            Curriculum Modules
          </h3>
          {ARTICLES.map((article) => {
            const isActive = selectedArticle.id === article.id;
            return (
              <div 
                key={article.id}
                onClick={() => handleSelect(article)}
                style={{
                  cursor: 'pointer',
                  borderRadius: '16px',
                  border: `1px solid ${isActive ? 'var(--primary-color)' : 'var(--glass-border)'}`,
                  background: isActive ? 'var(--surface)' : 'rgba(255,255,255,0.02)',
                  boxShadow: isActive ? '0 12px 24px rgba(14, 116, 144, 0.1)' : 'none',
                  transform: isActive ? 'scale(1.02)' : 'scale(1)',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  padding: '20px',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'var(--surface)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }
                }}
              >
                {isActive && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: 'var(--primary-color)' }} />}
                
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ fontSize: '24px', background: isActive ? 'rgba(14, 116, 144, 0.1)' : 'var(--background)', padding: '10px', borderRadius: '12px' }}>
                    {article.icon}
                  </div>
                  <div>
                    <span style={{ 
                      fontSize: '11px', 
                      fontWeight: 'bold', 
                      textTransform: 'uppercase', 
                      color: isActive ? 'var(--primary-color)' : 'var(--text-muted)',
                      display: 'block',
                      marginBottom: '4px',
                      letterSpacing: '0.5px'
                    }}>
                      {article.category}
                    </span>
                    <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '8px', color: 'var(--text-main)', lineHeight: '1.4' }}>
                      {article.title}
                    </h3>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Article Detail View */}
        <div className="glass-panel" style={{ 
          padding: '48px', 
          minHeight: '600px',
          opacity: isFading ? 0 : 1,
          transform: isFading ? 'translateY(10px)' : 'translateY(0)',
          transition: 'opacity 0.2s ease, transform 0.2s ease',
          boxShadow: '0 20px 40px rgba(0,0,0,0.03)'
        }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ fontSize: '32px' }}>{selectedArticle.icon}</div>
            <span style={{ 
              fontSize: '13px', 
              fontWeight: '700', 
              textTransform: 'uppercase', 
              color: 'var(--primary-color)',
              letterSpacing: '1px',
              padding: '6px 12px',
              background: 'rgba(14, 116, 144, 0.1)',
              borderRadius: '20px'
            }}>
              {selectedArticle.category}
            </span>
          </div>

          <h2 style={{ 
            fontSize: '36px', 
            fontWeight: '800',
            marginBottom: '24px', 
            color: 'var(--text-main)',
            lineHeight: '1.2'
          }}>
            {selectedArticle.title}
          </h2>
          
          <div style={{ 
            padding: '20px', 
            background: 'var(--background)', 
            borderRadius: '16px', 
            borderLeft: '4px solid var(--primary-color)',
            marginBottom: '40px',
            fontSize: '16px',
            color: 'var(--text-muted)',
            fontStyle: 'italic',
            lineHeight: '1.6'
          }}>
            {selectedArticle.summary}
          </div>

          <div className="article-content" style={{ 
            color: 'var(--text-main)', 
            lineHeight: '1.9', 
            fontSize: '17px'
          }}>
            {selectedArticle.content.split('\n\n').map((paragraph, idx) => {
              if (paragraph.startsWith('###')) {
                return <h3 key={idx} style={{ fontSize: '22px', fontWeight: '700', marginTop: '40px', marginBottom: '16px', color: 'var(--text-main)' }}>{paragraph.replace('### ', '')}</h3>;
              }
              if (paragraph.startsWith('-')) {
                const listItems = paragraph.split('\n').map((item, i) => {
                  const content = item.replace('- ', '');
                  const [boldPart, ...rest] = content.split('**:');
                  if (rest.length > 0) {
                    return <li key={i} style={{ marginBottom: '12px', paddingLeft: '8px' }}><strong style={{ color: 'var(--primary-color)' }}>{boldPart.replace('**', '')}:</strong>{rest.join('**:')}</li>;
                  }
                  return <li key={i} style={{ marginBottom: '12px', paddingLeft: '8px' }}>{content}</li>;
                });
                return <ul key={idx} style={{ marginBottom: '24px', paddingLeft: '24px' }}>{listItems}</ul>;
              }
              return <p key={idx} style={{ marginBottom: '24px' }}>{paragraph}</p>;
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
