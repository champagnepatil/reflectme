import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { PatientMonitoringForm } from '../../components/monitoring/PatientMonitoringForm';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  ClipboardList, 
  CheckCircle, 
  Clock, 
  LineChart,
  Play,
  FileText,
  Award
} from 'lucide-react';

const Monitoring: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'assessments' | 'wellness' | 'trends'>('assessments');
  
  const handleSubmitSuccess = () => {
    console.log('Monitoring form submitted successfully');
  };

  // Assessment scales data
  const assessmentScales = [
    {
      id: 'phq9',
      name: 'PHQ-9',
      title: 'Depression',
      description: 'Patient Health Questionnaire for depression assessment',
      duration: '5 min',
      status: 'available',
      lastCompleted: null,
      icon: '😔'
    },
    {
      id: 'gad7',
      name: 'GAD-7',
      title: 'Anxiety',
      description: 'Generalized Anxiety Disorder assessment scale',
      duration: '3 min',
      status: 'available',
      lastCompleted: '2024-12-15',
      icon: '😰'
    },
    {
      id: 'whodas',
      name: 'WHODAS-2.0',
      title: 'Functioning',
      description: 'World Health Organization Disability Assessment',
      duration: '8 min',
      status: 'in_progress',
      lastCompleted: null,
      icon: '🎯'
    },
    {
      id: 'dsm5',
      name: 'DSM-5-CC',
      title: 'Cross-Cutting Screening',
      description: 'Comprehensive multi-domain assessment',
      duration: '15 min',
      status: 'available',
      lastCompleted: '2024-12-10',
      icon: '📋'
    }
  ];

  const completedAssessments = [
    {
      id: '1',
      scale: 'GAD-7',
      score: 8,
      severity: 'Lieve',
      date: '2024-12-15',
      interpretation: 'Mild anxiety. Continue monitoring.'
    },
    {
      id: '2',
      scale: 'PHQ-9',
      score: 12,
      severity: 'Moderata',
      date: '2024-12-12',
      interpretation: 'Moderate depressive symptoms. Therapeutic intervention recommended.'
    },
    {
      id: '3',
      scale: 'DSM-5-CC',
      score: 15,
      severity: 'Lieve-Moderata',
      date: '2024-12-10',
      interpretation: 'Multi-domain screening shows multiple areas of attention.'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <ClipboardList className="w-8 h-8 text-blue-600" />
            Assessment Hub
          </h1>
          <p className="text-gray-600 mt-1">
            Complete your assessments and monitor daily wellness
          </p>
        </div>
        <div className="flex items-center text-gray-600">
          <Calendar className="w-4 h-4 mr-2" />
          <span>{new Date().toLocaleDateString('en-US', { 
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 p-1">
        <div className="flex gap-1">
          {[
            { id: 'assessments', label: 'Scale Assessment', icon: ClipboardList },
            { id: 'wellness', label: 'Daily Wellness', icon: BarChart3 },
            { id: 'trends', label: 'Personalized Trends', icon: LineChart }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </button>
          ))}
        </div>
      </div>

             {/* Tab Content */}
       {activeTab === 'assessments' && (
         <div className="space-y-6">
           {/* Available Assessments */}
           <div>
             <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
               <div className="flex items-start gap-3">
                 <div className="bg-blue-100 rounded-full p-2">
                   <FileText className="w-5 h-5 text-blue-600" />
                 </div>
                 <div>
                   <h3 className="font-semibold text-blue-900 mb-1">Assessment Guidance</h3>
                   <p className="text-blue-800 text-sm mb-2">
                     These assessments are typically recommended by your therapist based on your treatment plan and progress.
                   </p>
                   <p className="text-blue-700 text-sm">
                     💡 <strong>Best practice:</strong> Complete assessments when suggested by your therapist or during scheduled check-ins for the most accurate results.
                   </p>
                 </div>
               </div>
             </div>
             
             <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
               <ClipboardList className="w-6 h-6 text-blue-600" />
               Assessment Scales
               <span className="text-sm font-normal text-gray-600 ml-2">(Take when recommended by your therapist)</span>
             </h2>
             <div className="grid gap-4 md:grid-cols-2">
               {assessmentScales.map((scale) => (
                 <motion.div
                   key={scale.id}
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
                 >
                   <div className="flex items-start justify-between mb-4">
                     <div className="flex items-center gap-3">
                       <span className="text-2xl">{scale.icon}</span>
                       <div>
                         <h3 className="font-semibold text-gray-900">{scale.name}</h3>
                         <p className="text-sm text-gray-600">{scale.title}</p>
                       </div>
                     </div>
                     <div className="flex items-center gap-2">
                       {scale.status === 'in_progress' && (
                         <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                           <Clock className="w-3 h-3 mr-1" />
                           In progress
                         </span>
                       )}
                       {scale.lastCompleted && (
                         <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                           <CheckCircle className="w-3 h-3 mr-1" />
                           Completed
                         </span>
                       )}
                     </div>
                   </div>
                   
                   <p className="text-sm text-gray-600 mb-4">{scale.description}</p>
                   
                   <div className="flex items-center justify-between">
                     <span className="text-sm text-gray-500">
                       ⏱️ Duration: {scale.duration}
                     </span>
                     <Link
                       to={`/assessment/demo-client-1?scale=${scale.id}`}
                       className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                     >
                       {scale.status === 'in_progress' ? (
                         <>
                           <Play className="w-4 h-4 mr-2" />
                           Continue
                         </>
                       ) : (
                         <>
                           <ClipboardList className="w-4 h-4 mr-2" />
                           Start
                         </>
                       )}
                     </Link>
                   </div>
                   
                   {scale.lastCompleted && (
                     <div className="mt-4 pt-4 border-t border-gray-100">
                       <p className="text-xs text-gray-500">
                         Last completion: {new Date(scale.lastCompleted).toLocaleDateString('en-US')}
                       </p>
                     </div>
                   )}
                 </motion.div>
               ))}
             </div>
           </div>

           {/* Completed Assessments History */}
           <div>
             <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
               <FileText className="w-6 h-6 text-green-600" />
               Previous Results
             </h2>
             <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
               <div className="divide-y divide-gray-200">
                 {completedAssessments.map((assessment) => (
                   <div key={assessment.id} className="p-6 hover:bg-gray-50">
                     <div className="flex items-center justify-between">
                       <div className="flex-1">
                         <div className="flex items-center gap-4 mb-2">
                           <h3 className="font-semibold text-gray-900">{assessment.scale}</h3>
                           <span className="text-sm text-gray-500">
                             {new Date(assessment.date).toLocaleDateString('en-US')}
                           </span>
                         </div>
                         <p className="text-sm text-gray-600 mb-2">{assessment.interpretation}</p>
                       </div>
                       <div className="text-right">
                         <div className="text-2xl font-bold text-gray-900 mb-1">
                           {assessment.score}
                         </div>
                         <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                           assessment.severity === 'Lieve' ? 'bg-yellow-100 text-yellow-800' :
                           assessment.severity === 'Moderata' ? 'bg-orange-100 text-orange-800' :
                           'bg-red-100 text-red-800'
                         }`}>
                           {assessment.severity}
                         </span>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
             </div>
           </div>
         </div>
       )}

       {activeTab === 'wellness' && (
         <div className="space-y-6">
           {/* Stats Cards */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="bg-white rounded-lg border border-gray-200 p-6"
             >
               <div className="flex items-start justify-between">
                 <div>
                   <p className="text-gray-500 mb-1">Daily Check-ins</p>
                   <h3 className="text-2xl font-bold text-gray-900">7</h3>
                 </div>
                 <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                   <Calendar className="w-5 h-5 text-blue-600" />
                 </div>
               </div>
               <div className="mt-4 pt-4 border-t border-gray-200">
                 <div className="flex items-center text-green-600">
                   <TrendingUp className="w-4 h-4 mr-2" />
                   <span className="text-sm">This week</span>
                 </div>
               </div>
             </motion.div>

             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.1 }}
               className="bg-white rounded-lg border border-gray-200 p-6"
             >
               <div className="flex items-start justify-between">
                 <div>
                   <p className="text-gray-500 mb-1">Average Wellness</p>
                   <h3 className="text-2xl font-bold text-green-600">7.2/10</h3>
                 </div>
                 <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                   <BarChart3 className="w-5 h-5 text-green-600" />
                 </div>
               </div>
               <div className="mt-4 pt-4 border-t border-gray-200">
                 <div className="flex items-center text-green-600">
                   <TrendingUp className="w-4 h-4 mr-2" />
                   <span className="text-sm">+0.8 from last week</span>
                 </div>
               </div>
             </motion.div>

             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.2 }}
               className="bg-white rounded-lg border border-gray-200 p-6"
             >
               <div className="flex items-start justify-between">
                 <div>
                   <p className="text-gray-500 mb-1">Streak</p>
                   <h3 className="text-2xl font-bold text-orange-600">5 days</h3>
                 </div>
                 <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                   <Award className="w-5 h-5 text-orange-600" />
                 </div>
               </div>
               <div className="mt-4 pt-4 border-t border-gray-200">
                 <span className="text-sm text-gray-600">Keep it up!</span>
               </div>
             </motion.div>
           </div>

           {/* Wellness Form */}
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.3 }}
           >
             <PatientMonitoringForm 
               onSubmitSuccess={handleSubmitSuccess}
             />
           </motion.div>
         </div>
       )}

       {activeTab === 'trends' && (
         <div className="space-y-6">
           <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
             <LineChart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
             <h3 className="text-xl font-semibold text-gray-900 mb-2">
               Personalized Trends
             </h3>
             <p className="text-gray-600 mb-6">
               Personalized progress charts will be available after completing some assessments.
             </p>
             <div className="grid gap-4 md:grid-cols-2 text-left">
               <div className="p-4 bg-blue-50 rounded-lg">
                 <h4 className="font-medium text-blue-900 mb-2">📊 Trend Assessment</h4>
                 <p className="text-sm text-blue-700">
                   View the progression of your scores over time for each scale
                 </p>
               </div>
               <div className="p-4 bg-green-50 rounded-lg">
                 <h4 className="font-medium text-green-900 mb-2">�� Correlations</h4>
                 <p className="text-sm text-green-700">
                   Discover how daily wellness influences your assessments
                 </p>
               </div>
               <div className="p-4 bg-purple-50 rounded-lg">
                 <h4 className="font-medium text-purple-900 mb-2">🎯 Goals</h4>
                 <p className="text-sm text-purple-700">
                   Monitor progress towards your therapeutic goals
                 </p>
               </div>
               <div className="p-4 bg-orange-50 rounded-lg">
                 <h4 className="font-medium text-orange-900 mb-2">📈 AI Insights</h4>
                 <p className="text-sm text-orange-700">
                   Receive personalized insights based on your data
                 </p>
               </div>
             </div>
           </div>
         </div>
       )}

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-blue-50 border border-blue-200 rounded-lg p-6"
      >
        <h3 className="font-medium text-blue-900 mb-3">🎯 How the Assessment Hub Helps You</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <h4 className="font-medium mb-2">For You:</h4>
            <ul className="space-y-1">
              <li>• Monitor your progress over time</li>
              <li>• Identify patterns in your wellness</li>
              <li>• Maintain motivation with clear goals</li>
              <li>• Access all validated clinical scales</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">For Your Therapist:</h4>
            <ul className="space-y-1">
              <li>• Better understand your daily patterns</li>
              <li>• Adapt treatment based on real data</li>
              <li>• Identify triggers and positive influences</li>
              <li>• Provide more personalized support</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Monitoring;