/*
  # Technical Analysis Course Creation
  
  This migration creates a complete course on Technical Analysis with:
  1. Theme: Trading & Technical Analysis
  2. Module: Technical Analysis Fundamentals
  3. Course: Introduction to Technical Analysis
  4. Multiple sections with content and quizzes
*/

-- Create theme
INSERT INTO course_themes (id, name, description, icon, color, order_index)
VALUES (
  'c7e85c1b-3f45-4d42-9de9-f8c4a739b74a',
  'Trading & Technical Analysis',
  'Master the art and science of technical analysis in financial markets',
  '📊',
  '#4f46e5',
  1
);

-- Create module
INSERT INTO course_modules (
  id,
  theme_id,
  name,
  description,
  difficulty_level,
  prerequisites,
  learning_objectives,
  estimated_duration,
  order_index
)
VALUES (
  'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d',
  'c7e85c1b-3f45-4d42-9de9-f8c4a739b74a',
  'Technical Analysis Fundamentals',
  'Learn the essential concepts and tools of technical analysis for trading and investing',
  'beginner',
  '["Basic understanding of financial markets"]',
  '[
    "Understand price action and chart patterns",
    "Master key technical indicators",
    "Develop a technical analysis strategy",
    "Identify market trends and reversals",
    "Manage risk using technical analysis"
  ]',
  720,
  1
);

-- Create course
INSERT INTO courses (
  id,
  module_id,
  author_id,
  title,
  description,
  status,
  difficulty_level,
  estimated_duration,
  points_reward,
  requirements,
  learning_objectives,
  resources,
  order_index,
  published_at
)
VALUES (
  'f1e2d3c4-b5a6-4c3b-9d8e-7f6a5b4c3d2e',
  'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d',
  '00000000-0000-0000-0000-000000000000',
  'Introduction to Technical Analysis',
  'A comprehensive guide to understanding and applying technical analysis in trading. Learn how to read charts, identify patterns, and use technical indicators to make informed trading decisions.',
  'published',
  'beginner',
  120,
  100,
  '["Basic market knowledge", "Access to charting software"]',
  '[
    "Read and interpret different types of charts",
    "Identify major chart patterns",
    "Use technical indicators effectively",
    "Understand trend analysis",
    "Apply support and resistance concepts"
  ]',
  '[
    {
      "type": "article",
      "title": "Technical Analysis Explained",
      "url": "https://www.investopedia.com/technical-analysis-4689657"
    },
    {
      "type": "video",
      "title": "Introduction to Technical Analysis",
      "url": "https://www.youtube.com/watch?v=08R_CNHyMVY"
    }
  ]',
  1,
  now()
);

-- Create sections
INSERT INTO sections (id, course_id, title, content, type, order_index, estimated_duration)
VALUES
-- Section 1: Introduction to Charts
(
  'a5b6c7d8-e9f0-4a3b-8c2d-1e0f9a8b7c6d',
  'f1e2d3c4-b5a6-4c3b-9d8e-7f6a5b4c3d2e',
  'Understanding Price Charts',
  '# Understanding Price Charts

## Types of Charts

### Line Charts
![Line Chart Example](https://images.unsplash.com/photo-1642790106117-e829e14a795f?auto=format&fit=crop&q=80&w=2000)

A line chart is the simplest form of price representation. It shows a single line connecting closing prices over time.

**Advantages:**
- Clean and simple visualization
- Easy to spot trends
- Good for long-term analysis

### Candlestick Charts
![Candlestick Chart Example](https://images.unsplash.com/photo-1642790051717-145e6034ff1c?auto=format&fit=crop&q=80&w=2000)

Candlestick charts provide more detailed price information:
- Opening price
- Closing price
- High and low prices
- Market sentiment through colors

**Green/White candles:** Price closed higher than open
**Red/Black candles:** Price closed lower than open

### Bar Charts
Similar to candlesticks but using vertical bars:
- Top of bar: High price
- Bottom of bar: Low price
- Left tick: Opening price
- Right tick: Closing price

## Time Frames

Different time frames show different perspectives:
1. Intraday (1min, 5min, 15min, 1h)
2. Daily
3. Weekly
4. Monthly

**Choosing the right time frame:**
- Short-term trading: Lower time frames
- Long-term investing: Higher time frames
- Multiple time frame analysis for confirmation

## Volume Analysis

Volume is a crucial component:
- Confirms price movements
- Shows trading interest
- Helps identify trend strength

**High volume:**
- More significant price moves
- More reliable signals
- Better liquidity

**Low volume:**
- Less significant moves
- Potential false signals
- Limited liquidity',
  'text',
  1,
  30
),

-- Section 2: Trend Analysis
(
  'b6c7d8e9-f0a1-4b3c-9d2e-2f1a0b9c8d7e',
  'f1e2d3c4-b5a6-4c3b-9d8e-7f6a5b4c3d2e',
  'Trend Analysis',
  '# Trend Analysis

## Understanding Trends

### What is a Trend?
A trend is the general direction in which a market is moving. There are three types:
1. Uptrend (Higher highs and higher lows)
2. Downtrend (Lower highs and lower lows)
3. Sideways trend (Range-bound)

![Trend Types](https://images.unsplash.com/photo-1642790051749-0369c73f0d6b?auto=format&fit=crop&q=80&w=2000)

### Trend Lines
Drawing trend lines:
- Connect significant lows in uptrends
- Connect significant highs in downtrends
- Minimum of two points needed
- More touches = stronger trend line

## Support and Resistance

### Support Levels
- Price levels where buying pressure exceeds selling pressure
- Previous lows often become support
- Psychological round numbers
- High volume areas

### Resistance Levels
- Price levels where selling pressure exceeds buying pressure
- Previous highs often become resistance
- Psychological round numbers
- High volume areas

![Support and Resistance](https://images.unsplash.com/photo-1642790051726-146e6034ff1d?auto=format&fit=crop&q=80&w=2000)

## Moving Averages

### Types of Moving Averages
1. Simple Moving Average (SMA)
2. Exponential Moving Average (EMA)
3. Weighted Moving Average (WMA)

### Common Periods
- 20 EMA: Short-term trend
- 50 SMA: Medium-term trend
- 200 SMA: Long-term trend

### Moving Average Uses
- Trend identification
- Support/resistance levels
- Golden Cross/Death Cross signals
- Dynamic support/resistance',
  'text',
  2,
  45
),

-- Section 3: Chart Patterns
(
  'c7d8e9f0-a1b2-4c3d-9e2f-3f1b0c9d8e7f',
  'f1e2d3c4-b5a6-4c3b-9d8e-7f6a5b4c3d2e',
  'Chart Patterns',
  '# Chart Patterns

## Continuation Patterns

### Flags and Pennants
![Flags Pattern](https://images.unsplash.com/photo-1642790051728-146e6034ff1e?auto=format&fit=crop&q=80&w=2000)

Characteristics:
- Short-term consolidation
- Parallel lines (flags)
- Converging lines (pennants)
- Preceded by strong trend

### Triangles
Types:
1. Ascending
2. Descending
3. Symmetrical

Key points:
- Formed by converging trendlines
- Volume typically decreases
- Breakout direction important

## Reversal Patterns

### Head and Shoulders
Components:
- Left shoulder
- Head (higher high)
- Right shoulder
- Neckline

### Double Tops and Bottoms
Characteristics:
- Two similar peaks/troughs
- Volume confirmation
- Strong reversal signals

### Triple Tops and Bottoms
Similar to double patterns but:
- Three peaks/troughs
- More reliable
- Rarer occurrence

## Pattern Trading Tips

1. Wait for confirmation
2. Check volume
3. Consider context
4. Use stop losses
5. Multiple timeframe analysis',
  'text',
  3,
  45
);

-- Create quizzes
INSERT INTO quizzes (id, section_id, title, description, passing_score, points_reward)
VALUES
-- Quiz 1: Chart Types
(
  'd8e9f0a1-b2c3-4d3e-9f2f-4f1c0d9e8f7f',
  'a5b6c7d8-e9f0-4a3b-8c2d-1e0f9a8b7c6d',
  'Understanding Chart Types',
  'Test your knowledge of different chart types and their characteristics',
  70,
  20
),
-- Quiz 2: Trend Analysis
(
  'e9f0a1b2-c3d4-4e3f-9f2f-5f1d0e9f8f7f',
  'b6c7d8e9-f0a1-4b3c-9d2e-2f1a0b9c8d7e',
  'Trend Analysis Fundamentals',
  'Evaluate your understanding of trends, support, and resistance',
  70,
  25
),
-- Quiz 3: Chart Patterns
(
  'f0a1b2c3-d4e5-4f3f-9f2f-6f1e0f9f8f7f',
  'c7d8e9f0-a1b2-4c3d-9e2f-3f1b0c9d8e7f',
  'Chart Patterns Recognition',
  'Test your ability to identify and understand chart patterns',
  70,
  30
);

-- Create quiz questions
INSERT INTO quiz_questions (quiz_id, question, type, options, correct_answer, explanation, points, order_index)
VALUES
-- Questions for Quiz 1
(
  'd8e9f0a1-b2c3-4d3e-9f2f-4f1c0d9e8f7f',
  'Which chart type shows the most price information?',
  'multiple_choice',
  '["Line chart", "Bar chart", "Candlestick chart", "Area chart"]',
  'Candlestick chart',
  'Candlestick charts show opening, closing, high, and low prices for each period.',
  2,
  1
),
(
  'd8e9f0a1-b2c3-4d3e-9f2f-4f1c0d9e8f7f',
  'What does a green candlestick typically indicate?',
  'multiple_choice',
  '["Price closed lower than open", "Price closed higher than open", "No price change", "Market was closed"]',
  'Price closed higher than open',
  'A green (or white) candlestick indicates that the closing price was higher than the opening price.',
  2,
  2
),
(
  'd8e9f0a1-b2c3-4d3e-9f2f-4f1c0d9e8f7f',
  'High volume generally indicates:',
  'multiple_choice',
  '["Less significant price moves", "More significant price moves", "Market closure", "Price reversal only"]',
  'More significant price moves',
  'High volume suggests strong market participation and more significant price movements.',
  2,
  3
),

-- Questions for Quiz 2
(
  'e9f0a1b2-c3d4-4e3f-9f2f-5f1d0e9f8f7f',
  'What characterizes an uptrend?',
  'multiple_choice',
  '["Lower highs and lower lows", "Higher highs and higher lows", "Equal highs and lows", "Random price movements"]',
  'Higher highs and higher lows',
  'An uptrend is characterized by a series of higher highs and higher lows in price movement.',
  2,
  1
),
(
  'e9f0a1b2-c3d4-4e3f-9f2f-5f1d0e9f8f7f',
  'The 200-day moving average is typically used for:',
  'multiple_choice',
  '["Intraday trading", "Short-term analysis", "Long-term trend identification", "Scalping"]',
  'Long-term trend identification',
  'The 200-day moving average is commonly used to identify and confirm long-term market trends.',
  2,
  2
),
(
  'e9f0a1b2-c3d4-4e3f-9f2f-5f1d0e9f8f7f',
  'Support levels are areas where:',
  'multiple_choice',
  '["Selling pressure exceeds buying pressure", "Buying pressure exceeds selling pressure", "No trading occurs", "Prices move sideways only"]',
  'Buying pressure exceeds selling pressure',
  'Support levels are price areas where buying pressure typically exceeds selling pressure, preventing further price decline.',
  2,
  3
),

-- Questions for Quiz 3
(
  'f0a1b2c3-d4e5-4f3f-9f2f-6f1e0f9f8f7f',
  'Which pattern is considered a continuation pattern?',
  'multiple_choice',
  '["Head and shoulders", "Double top", "Flag", "Triple bottom"]',
  'Flag',
  'Flag patterns are continuation patterns that represent temporary pauses in the prevailing trend.',
  2,
  1
),
(
  'f0a1b2c3-d4e5-4f3f-9f2f-6f1e0f9f8f7f',
  'A head and shoulders pattern is typically:',
  'multiple_choice',
  '["A continuation pattern", "A reversal pattern", "A neutral pattern", "A momentum pattern"]',
  'A reversal pattern',
  'The head and shoulders pattern is one of the most reliable reversal patterns in technical analysis.',
  2,
  2
),
(
  'f0a1b2c3-d4e5-4f3f-9f2f-6f1e0f9f8f7f',
  'When trading chart patterns, it''s most important to:',
  'multiple_choice',
  '["Enter immediately when you spot a pattern", "Wait for pattern confirmation", "Ignore volume", "Trade against the pattern"]',
  'Wait for pattern confirmation',
  'Waiting for pattern confirmation helps avoid false signals and improves trading success rate.',
  2,
  3
);