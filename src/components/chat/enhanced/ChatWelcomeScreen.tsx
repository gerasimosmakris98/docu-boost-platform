
import { motion } from "framer-motion";
import { Bot, Sparkles, Zap, Heart, Target, Users } from "lucide-react";

const ChatWelcomeScreen = () => {
  const features = [
    {
      icon: Target,
      title: "Career Guidance",
      description: "Get personalized advice for your career journey",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Users,
      title: "Interview Prep",
      description: "Practice interviews and get expert feedback",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Zap,
      title: "Resume Optimization",
      description: "Enhance your resume for maximum impact",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Heart,
      title: "Skill Development",
      description: "Identify and develop in-demand skills",
      color: "from-orange-500 to-red-500"
    }
  ];

  return (
    <motion.div 
      className="flex flex-col items-center justify-center h-full text-center p-8 max-w-4xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Main welcome section */}
      <div className="mb-12">
        {/* Animated bot with sparkles */}
        <motion.div className="relative mb-8">
          <motion.div
            animate={{ 
              rotate: [0, 5, -5, 0],
              y: [0, -10, 0]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="relative"
          >
            <div className="h-24 w-24 mx-auto bg-gradient-to-br from-cyan-500/90 to-teal-600/90 rounded-2xl flex items-center justify-center shadow-2xl border-2 border-cyan-400/60">
              <Bot className="h-12 w-12 text-white" />
            </div>
            
            {/* Floating sparkles */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)'
                }}
                animate={{
                  rotate: [0, 360],
                  x: [0, Math.cos(i * 45 * Math.PI / 180) * 60],
                  y: [0, Math.sin(i * 45 * Math.PI / 180) * 60],
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut"
                }}
              >
                <Sparkles className="h-4 w-4 text-yellow-400" />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Welcome text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="space-y-4 mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            Welcome to Your AI Career Advisor
          </h1>
          <p className="text-xl text-white/80 leading-relaxed max-w-2xl mx-auto">
            I'm here to guide you through every step of your career journey. Whether you need help with 
            resumes, interviews, job searches, or career planning, I've got you covered.
          </p>
        </motion.div>

        {/* Feature cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 max-w-3xl mx-auto"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 + index * 0.1, duration: 0.4 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-6 text-left hover:bg-white/10 transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 shadow-lg`}>
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-white/70 text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Call to action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="space-y-4"
        >
          <p className="text-white/60 text-lg">
            Ready to accelerate your career? Start by typing a message below.
          </p>
          
          {/* Suggested prompts */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {[
              "Help me improve my resume",
              "Prepare me for an interview",
              "Find my dream job",
              "Develop new skills"
            ].map((prompt, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.4 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-sm text-white/80 hover:text-white transition-all duration-200"
              >
                {prompt}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ChatWelcomeScreen;
