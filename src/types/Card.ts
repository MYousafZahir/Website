export interface Card {
  id: string;
  name: string;
  description: string; // Short description shown on card
  videoUrl?: string; // YouTube embed URL
  tech: string[]; // List of technologies used
  expandedDescription: string; // Full description shown on board
  codeSample?: string; // Sample code snippet
  category?: string; // Navigation category (e.g., 'navigation', 'projects')
}

// Initial navigation cards
export const initialCards: Card[] = [
  {
    id: 'nav-contact',
    name: 'Contact',
    description: 'Get in touch.',
    category: 'navigation',
    tech: [],
    expandedDescription: 'Contact information and ways to reach out.',
  },
  {
    id: 'nav-about',
    name: 'About',
    description: 'Learn more about me.',
    category: 'navigation',
    tech: [],
    expandedDescription: 'About me and my background.',
  },
  {
    id: 'nav-projects',
    name: 'Projects',
    description: 'View my work.',
    category: 'navigation',
    tech: [],
    expandedDescription: 'A collection of my projects.',
  },
  {
    id: 'nav-blog',
    name: 'Blog',
    description: 'Read my thoughts.',
    category: 'navigation',
    tech: [],
    expandedDescription: 'Blog posts and articles.',
  },
];

// Project cards deck
export const projectCards: Card[] = [
  {
    id: 'project-1',
    name: 'Project 1',
    description: 'Amazing project showcase.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    category: 'projects',
    tech: ['React', 'TypeScript', 'Node.js'],
    expandedDescription: 'This is the first project in my portfolio. It demonstrates various skills and technologies.',
    codeSample: `function Project1() {
  return <div>Project 1 Content</div>;
}`
  },
  {
    id: 'project-2',
    name: 'Project 2',
    description: 'Innovative solution.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    category: 'projects',
    tech: ['Vue.js', 'Python', 'PostgreSQL'],
    expandedDescription: 'The second project showcases different technologies and approaches.',
    codeSample: `def project2():
    return "Project 2 Result"`
  },
  {
    id: 'project-3',
    name: 'Project 3',
    description: 'Creative implementation.',
    category: 'projects',
    tech: ['React', 'Firebase', 'Material UI'],
    expandedDescription: 'Third project demonstrating creative problem-solving.',
    codeSample: `const Project3 = () => {
  const [data, setData] = useState([]);
  return <Card>{data}</Card>;
};`
  },
];

// Blog post cards deck
export const blogCards: Card[] = [
  {
    id: 'blog-1',
    name: 'Blog Post 1',
    description: 'First blog post entry.',
    category: 'blog',
    tech: [],
    expandedDescription: 'This is the first blog post discussing various topics and insights.',
  },
  {
    id: 'blog-2',
    name: 'Blog Post 2',
    description: 'Second blog post entry.',
    category: 'blog',
    tech: [],
    expandedDescription: 'The second blog post explores different themes and perspectives.',
  },
  {
    id: 'blog-3',
    name: 'Blog Post 3',
    description: 'Third blog post entry.',
    category: 'blog',
    tech: [],
    expandedDescription: 'Third blog post covering additional topics and thoughts.',
  },
];

// Back card
export const backCard: Card = {
  id: 'back',
  name: 'Back',
  description: 'Return to main menu.',
  category: 'navigation',
  tech: [],
  expandedDescription: 'Return to the main navigation.',
};

// Legacy sample cards (keeping for backwards compatibility)
export const sampleCards: Card[] = [
  {
    id: '1',
    name: 'E-Commerce Platform',
    description: 'Full-stack shopping experience.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    tech: ['React', 'Node.js', 'MongoDB', 'Stripe API'],
    expandedDescription: 'A fully-featured e-commerce platform with user authentication, shopping cart, payment processing, and admin dashboard. Built with modern web technologies to provide a seamless shopping experience.',
    codeSample: `function checkout() {
  const cart = getCartItems();
  const total = calculateTotal(cart);
  return processPayment(total);
}`
  },
  {
    id: '2',
    name: 'Task Management App',
    description: 'Productivity at your fingertips.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    tech: ['React', 'TypeScript', 'Firebase', 'Material UI'],
    expandedDescription: 'A collaborative task management application with real-time updates, drag-and-drop functionality, and team collaboration features. Designed to boost productivity and streamline workflows.',
    codeSample: `const Task = ({ task }) => {
  const [status, setStatus] = useState(task.status);
  return (
    <TaskCard status={status} onUpdate={setStatus}>
      {task.title}
    </TaskCard>
  );
};`
  },
  {
    id: '3',
    name: 'Social Media Dashboard',
    description: 'Analytics and insights.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    tech: ['Vue.js', 'Python', 'PostgreSQL', 'D3.js'],
    expandedDescription: 'A comprehensive social media analytics dashboard that aggregates data from multiple platforms. Features interactive charts, engagement metrics, and automated reporting.',
    codeSample: `async function fetchAnalytics() {
  const data = await Promise.all([
    getTwitterMetrics(),
    getFacebookMetrics(),
    getInstagramMetrics()
  ]);
  return aggregateData(data);
}`
  },
  {
    id: '4',
    name: 'Machine Learning Model',
    description: 'AI-powered predictions.',
    tech: ['Python', 'TensorFlow', 'scikit-learn', 'Flask'],
    expandedDescription: 'A machine learning model for predictive analytics with RESTful API integration. Trained on large datasets and optimized for production deployment.',
    codeSample: `from tensorflow import keras

model = keras.Sequential([
  keras.layers.Dense(128, activation='relu'),
  keras.layers.Dense(64, activation='relu'),
  keras.layers.Dense(1, activation='sigmoid')
])
model.compile(optimizer='adam', loss='binary_crossentropy')`
  },
  {
    id: '5',
    name: 'Mobile Game',
    description: 'Cross-platform gaming.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    tech: ['Unity', 'C#', 'Photon', 'PlayFab'],
    expandedDescription: 'A multiplayer mobile game built with Unity featuring real-time multiplayer gameplay, in-app purchases, and cloud save functionality.',
    codeSample: `void Update() {
  if (Input.GetButtonDown("Jump")) {
    player.Jump();
  }
  player.Move(Input.GetAxis("Horizontal"));
}`
  },
  {
    id: '6',
    name: 'Blockchain Explorer',
    description: 'Real-time blockchain data.',
    tech: ['React', 'Web3.js', 'Ethereum', 'GraphQL'],
    expandedDescription: 'A real-time blockchain explorer that displays transaction history, wallet balances, and smart contract interactions. Built with Web3.js for Ethereum integration.',
    codeSample: `const web3 = new Web3(provider);
const balance = await web3.eth.getBalance(address);
const transactions = await getTransactionHistory(address);`
  },
  {
    id: '7',
    name: 'Data Visualization Tool',
    description: 'Interactive charts and graphs.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    tech: ['D3.js', 'React', 'Express', 'MongoDB'],
    expandedDescription: 'An interactive data visualization tool that transforms complex datasets into beautiful, interactive charts and graphs. Supports multiple data formats and export options.',
    codeSample: `const svg = d3.select("body")
  .append("svg")
  .attr("width", width)
  .attr("height", height);
svg.selectAll("circle")
  .data(data)
  .enter()
  .append("circle")
  .attr("cx", d => xScale(d.x))
  .attr("cy", d => yScale(d.y));`
  }
];

