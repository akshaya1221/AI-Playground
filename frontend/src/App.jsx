import { memo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  Activity,
  BarChart3,
  Brain,
  CheckCircle2,
  Database,
  Download,
  Eye,
  FileDown,
  FlaskConical,
  History,
  Info,
  LineChart,
  Loader2,
  Play,
  Rocket,
  SlidersHorizontal,
  Sparkles,
  Target,
  Trash2,
  Upload,
  Wand2,
  AlertTriangle,
} from 'lucide-react'

const APP_VERSION = 'v1.0.0'
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '')
const HISTORY_STORAGE_KEY = 'ai-playground-experiment-history'

async function apiFetch(path, options) {
  return fetch(`${API_BASE_URL}${path}`, options)
}

async function getApiErrorMessage(response, fallbackMessage) {
  try {
    const data = await response.json()
    return data.message || data.detail || fallbackMessage
  } catch {
    return fallbackMessage
  }
}

function cleanErrorMessage(error, fallbackMessage) {
  if (!error?.message || error.message === 'Failed to fetch') {
    return `${fallbackMessage} Please check that the backend is running and try again.`
  }

  return error.message
}

const modelOptions = [
  'Logistic Regression',
  'Decision Tree',
  'Random Forest',
  'KNN',
  'Naive Bayes',
]

const regressionModelOptions = [
  'Linear Regression',
  'Decision Tree Regressor',
  'Random Forest Regressor',
  'KNN Regressor',
]

const workflowLinks = [
  ['Upload', 'upload'],
  ['Task', 'task'],
  ['Insights', 'insights'],
  ['Clean', 'preprocessing'],
  ['Settings', 'evaluation-settings'],
  ['Train', 'train'],
  ['Tune', 'tune'],
  ['Compare', 'compare'],
  ['Predict', 'predict'],
  ['Import', 'import-model'],
  ['Report', 'report'],
  ['History', 'history'],
]

const heroCards = [
  { title: 'Upload Dataset', icon: Upload },
  { title: 'Analyze Data', icon: Database },
  { title: 'Train Models', icon: Brain },
  { title: 'Compare Results', icon: BarChart3 },
  { title: 'Predict Outcomes', icon: Wand2 },
  { title: 'Download Report', icon: FileDown },
]

const workflowSteps = [
  { id: 'upload', title: 'Upload Dataset', description: 'Bring in a CSV file and preview the records.', icon: Upload },
  { id: 'target', title: 'Select Target', description: 'Choose the output column the model should predict.', icon: Target },
  { id: 'task', title: 'Choose Task', description: 'Decide whether to predict categories or numeric values.', icon: SlidersHorizontal },
  { id: 'insights', title: 'Analyze Data', description: 'Review row counts, column types, and missing values.', icon: Database },
  { id: 'preprocessing', title: 'Preprocess Data', description: 'Clean missing values, duplicates, constants, and categorical columns.', icon: SlidersHorizontal },
  { id: 'evaluation-settings', title: 'Evaluation Settings', description: 'Choose the train/test split and cross-validation options.', icon: SlidersHorizontal },
  { id: 'train', title: 'Train Model', description: 'Fit a classification model and inspect evaluation metrics.', icon: Brain },
  { id: 'tune', title: 'Tune Model', description: 'Test model settings and keep the strongest configuration.', icon: SlidersHorizontal },
  { id: 'compare', title: 'Compare Models', description: 'Benchmark algorithms side by side with an accuracy chart.', icon: BarChart3 },
  { id: 'predict', title: 'Predict', description: 'Enter new values and generate a model prediction.', icon: Wand2 },
  { id: 'import-model', title: 'Import Model', description: 'Upload a saved model and use it for prediction.', icon: Upload },
  { id: 'report', title: 'Download Report', description: 'Export a PDF summary for documentation or viva.', icon: FileDown },
]

function Navbar({ onOpenAbout }) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/90 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
        <a href="#top" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20">
            <Sparkles size={22} />
          </div>
          <div>
            <p className="text-lg font-bold text-white">AI-Playground</p>
            <p className="text-sm text-cyan-200">No-Code ML Experiment Lab</p>
          </div>
        </a>

        <div className="flex flex-wrap gap-2">
          {workflowLinks.map(([label, target]) => (
            <a
              key={target}
              href={`#${target}`}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              {label}
            </a>
          ))}
          <button
            type="button"
            onClick={onOpenAbout}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-cyan-100 transition hover:bg-white/10 hover:text-white"
          >
            <Info size={16} />
            About
          </button>
        </div>
      </nav>
    </header>
  )
}

function HeroSection() {
  return (
    <section id="top" className="relative overflow-hidden bg-slate-950 px-6 py-20 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(139,92,246,0.16),_transparent_34%)]" />
      <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-100">
            <FlaskConical size={16} />
            No-Code ML Experiment Lab
          </div>
          <h1 className="max-w-4xl text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            Build, Train, Compare & Predict ML Models Without Code
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Upload a CSV dataset, explore its structure, select a target column,
            train classification models, compare performance, make predictions,
            and export a clean experiment report.
          </p>
          <a
            href="#upload"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-6 py-3 text-base font-bold text-slate-950 shadow-xl shadow-cyan-500/20 transition hover:bg-cyan-300"
          >
            <Play size={18} />
            Start Experiment
          </a>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {heroCards.map(({ title, icon: Icon }) => (
            <div
              key={title}
              className="rounded-2xl border border-white/10 bg-white/10 p-5 shadow-2xl shadow-slate-950/20 backdrop-blur"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-950">
                <Icon size={21} />
              </div>
              <p className="font-semibold text-white">{title}</p>
              <p className="mt-2 text-sm text-slate-300">
                Clear workflow tools for every stage of your experiment.
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function WorkflowOverview() {
  return (
    <section className="border-b border-slate-200 bg-white px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-cyan-700">
              Workflow
            </p>
            <h2 className="mt-2 text-3xl font-bold text-slate-950">
              A guided path from dataset to report
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-600">
            Follow the workspace from left to right: upload, inspect, train,
            compare, predict, and export without writing code.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-7">
          {workflowSteps.map(({ id, title, description, icon: Icon }, index) => (
            <a
              key={title}
              href={`#${id}`}
              className="group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-1 hover:border-cyan-200 hover:bg-white hover:shadow-lg hover:shadow-slate-200/70"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-cyan-300">
                  <Icon size={19} />
                </div>
                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-slate-500 ring-1 ring-slate-200">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>
              <h3 className="mt-4 font-bold text-slate-950 group-hover:text-cyan-700">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-5 text-slate-600">
                {description}
              </p>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

const StepCard = memo(function StepCard({ id, title, description, icon: Icon, children }) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-cyan-300">
              <Icon size={22} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-950">{title}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                {description}
              </p>
            </div>
          </div>
        </div>
        {children}
      </div>
    </section>
  )
})

function Alert({ type = 'info', children }) {
  const styles = {
    info: 'border-blue-200 bg-blue-50 text-blue-800',
    success: 'border-green-200 bg-green-50 text-green-800',
    error: 'border-red-200 bg-red-50 text-red-800',
  }

  return (
    <div
      role={type === 'error' ? 'alert' : 'status'}
      aria-live="polite"
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm font-medium ${styles[type]}`}
    >
      {type === 'success' && <CheckCircle2 className="mt-0.5 shrink-0" size={18} />}
      {type === 'error' && <AlertTriangle className="mt-0.5 shrink-0" size={18} />}
      {children}
    </div>
  )
}

function ErrorAlert({ children }) {
  return <Alert type="error">{children}</Alert>
}

function SuccessAlert({ children }) {
  return <Alert type="success">{children}</Alert>
}

function PrimaryButton({ children, icon: Icon, className = '', ...props }) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-slate-900/10 transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none ${className}`}
      {...props}
    >
      {Icon && <Icon size={18} />}
      {children}
    </button>
  )
}

function AccentButton({ children, icon: Icon, className = '', ...props }) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none ${className}`}
      {...props}
    >
      {Icon && <Icon size={18} />}
      {children}
    </button>
  )
}

const MetricCard = memo(function MetricCard({ label, value, highlight = false }) {
  return (
    <div
      className={`rounded-xl border p-5 ${
        highlight
          ? 'border-cyan-200 bg-cyan-50'
          : 'border-slate-200 bg-slate-50'
      }`}
    >
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 break-words text-2xl font-bold text-slate-950">{value}</p>
    </div>
  )
})

function EmptyState({ children, icon: Icon = Info }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 ring-1 ring-slate-200">
        <Icon size={18} />
      </div>
      <div className="leading-6">{children}</div>
    </div>
  )
}

function LoadingState({ children = 'Loading...' }) {
  return (
    <div role="status" aria-live="polite" className="flex items-center gap-3 rounded-xl border border-cyan-100 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-800">
      <Loader2 className="animate-spin" size={18} />
      {children}
    </div>
  )
}

function AboutModal({ onClose }) {
  const features = [
    'CSV upload and dataset preview',
    'Classification and regression experiments',
    'Training, comparison, tuning, and prediction',
    'Feature insights, preprocessing, cross-validation, and reports',
    'Experiment history plus model export and import',
  ]

  const technologies = ['React', 'FastAPI', 'Scikit-learn', 'Tailwind', 'Recharts']

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-6 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-white/10 bg-white p-6 shadow-2xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-cyan-800">
              <Rocket size={14} />
              Deployment Ready
            </span>
            <h2 className="mt-4 text-3xl font-bold text-slate-950">AI-Playground</h2>
            <p className="mt-2 text-sm font-semibold text-slate-500">{APP_VERSION}</p>
          </div>
          <SecondaryButton onClick={onClose}>Close</SecondaryButton>
        </div>

        <p className="mt-5 leading-7 text-slate-700">
          AI-Playground is a no-code machine learning experimentation platform for uploading datasets,
          preparing data, training models, comparing results, making predictions, and exporting reports
          from one clean dashboard.
        </p>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <h3 className="font-bold text-slate-950">Supported features</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {features.map((feature) => (
                <li key={feature} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-cyan-500" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <h3 className="font-bold text-slate-950">Technologies used</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {technologies.map((technology) => (
                <span
                  key={technology}
                  className="rounded-lg bg-white px-3 py-2 text-sm font-bold text-slate-700 ring-1 ring-slate-200"
                >
                  {technology}
                </span>
              ))}
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              The frontend reads the backend URL from <code className="font-bold">VITE_API_BASE_URL</code>,
              so the same interface can run locally or on hosted platforms.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function SecondaryButton({ children, icon: Icon, className = '', ...props }) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-800 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 ${className}`}
      {...props}
    >
      {Icon && <Icon size={17} />}
      {children}
    </button>
  )
}

function App() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [datasetInfo, setDatasetInfo] = useState(null)
  const [targetColumn, setTargetColumn] = useState('')
  const [targetMessage, setTargetMessage] = useState('')
  const [datasetInsights, setDatasetInsights] = useState(null)
  const [insightsLoading, setInsightsLoading] = useState(false)
  const [insightsError, setInsightsError] = useState('')
  const [featureAnalysis, setFeatureAnalysis] = useState(null)
  const [featureAnalysisLoading, setFeatureAnalysisLoading] = useState(false)
  const [featureAnalysisError, setFeatureAnalysisError] = useState('')
  const [taskType, setTaskType] = useState('classification')
  const [testSize, setTestSize] = useState(0.2)
  const [randomState, setRandomState] = useState(42)
  const [useCrossValidation, setUseCrossValidation] = useState(false)
  const [cvFolds, setCvFolds] = useState(5)
  const [preprocessingSettings, setPreprocessingSettings] = useState({
    remove_duplicates: true,
    remove_constant_columns: true,
    numeric_missing_strategy: 'mean',
    categorical_missing_strategy: 'mode',
    scale_numeric: false,
    encoding_strategy: 'onehot',
  })
  const [selectedModel, setSelectedModel] = useState('')
  const [training, setTraining] = useState(false)
  const [trainingError, setTrainingError] = useState('')
  const [trainingResult, setTrainingResult] = useState(null)
  const [tuningModel, setTuningModel] = useState('')
  const [tuning, setTuning] = useState(false)
  const [tuningError, setTuningError] = useState('')
  const [tuningResult, setTuningResult] = useState(null)
  const [predictionInputs, setPredictionInputs] = useState({})
  const [predicting, setPredicting] = useState(false)
  const [predictionError, setPredictionError] = useState('')
  const [predictionResult, setPredictionResult] = useState(null)
  const [importedModelInfo, setImportedModelInfo] = useState(null)
  const [modelFile, setModelFile] = useState(null)
  const [importingModel, setImportingModel] = useState(false)
  const [modelImportMessage, setModelImportMessage] = useState('')
  const [modelImportError, setModelImportError] = useState('')
  const [exportingModel, setExportingModel] = useState(false)
  const [modelExportMessage, setModelExportMessage] = useState('')
  const [modelExportError, setModelExportError] = useState('')
  const [modelPortability, setModelPortability] = useState(null)
  const [comparing, setComparing] = useState(false)
  const [compareError, setCompareError] = useState('')
  const [compareResult, setCompareResult] = useState(null)
  const [reportLoading, setReportLoading] = useState(false)
  const [reportMessage, setReportMessage] = useState('')
  const [reportError, setReportError] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState('')
  const [error, setError] = useState('')
  const [experimentHistory, setExperimentHistory] = useState(() => {
    const savedHistory = localStorage.getItem(HISTORY_STORAGE_KEY)

    if (!savedHistory) return []

    try {
      return JSON.parse(savedHistory)
    } catch {
      return []
    }
  })
  const [expandedExperimentId, setExpandedExperimentId] = useState('')
  const [currentExperimentId, setCurrentExperimentId] = useState('')
  const [showAboutModal, setShowAboutModal] = useState(false)

  const saveExperimentHistory = (historyItems) => {
    setExperimentHistory(historyItems)
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(historyItems))
  }

  const updateSavedExperiment = (experimentId, updates) => {
    if (!experimentId) return

    saveExperimentHistory(
      experimentHistory.map((experiment) =>
        experiment.experiment_id === experimentId
          ? { ...experiment, ...updates }
          : experiment
      )
    )
  }

  const buildExperimentRecord = (trainingData, createdAt) => ({
    experiment_id: `EXP-${createdAt.getTime()}`,
    date_time: createdAt.toLocaleString(),
    filename: datasetInfo?.filename || 'Unknown dataset',
    target_column: targetColumn,
    task_type: trainingData.task_type || taskType,
    evaluation_settings: {
      test_size: testSize,
      random_state: randomState,
      use_cross_validation: useCrossValidation,
      cv_folds: cvFolds,
    },
    preprocessing_settings: trainingData.preprocessing_settings_used || preprocessingSettings,
    selected_model: trainingData.model_name,
    accuracy: trainingData.accuracy,
    total_rows: trainingData.total_rows,
    training_rows: trainingData.training_rows,
    testing_rows: trainingData.testing_rows,
    feature_columns: trainingData.feature_columns,
    best_model: compareResult?.best_model || null,
    comparison_results: compareResult?.results || null,
    recommendation: compareResult?.recommendation || null,
    tuning_result: tuningResult || null,
    feature_analysis: featureAnalysis || null,
    cv_scores: trainingData.cv_scores || null,
    cv_mean_score: trainingData.cv_mean_score || null,
    cv_std_score: trainingData.cv_std_score || null,
    cv_folds: trainingData.cv_folds || null,
    model_portability: modelPortability || null,
    prediction_result: predictionResult || null,
  })

  const buildTuningHistoryRecord = (tuningData, createdAt) => ({
    experiment_id: `EXP-${createdAt.getTime()}`,
    date_time: createdAt.toLocaleString(),
    filename: datasetInfo?.filename || 'Unknown dataset',
    target_column: targetColumn,
    task_type: tuningData.task_type || taskType,
    evaluation_settings: {
      test_size: testSize,
      random_state: randomState,
      use_cross_validation: useCrossValidation,
      cv_folds: cvFolds,
    },
    preprocessing_settings: preprocessingSettings,
    selected_model: tuningData.model_name,
    accuracy: tuningData.tuned_accuracy,
    total_rows: tuningData.total_rows,
    training_rows: tuningData.training_rows,
    testing_rows: tuningData.testing_rows,
    feature_columns: featureColumns,
    best_model: compareResult?.best_model || null,
    comparison_results: compareResult?.results || null,
    recommendation: compareResult?.recommendation || null,
    tuning_result: tuningData,
    feature_analysis: featureAnalysis || null,
    cv_scores: null,
    cv_mean_score: null,
    cv_std_score: null,
    cv_folds: null,
    prediction_result: predictionResult || null,
  })

  const buildFeatureAnalysisHistoryRecord = (analysisData, createdAt) => ({
    experiment_id: `EXP-${createdAt.getTime()}`,
    date_time: createdAt.toLocaleString(),
    filename: datasetInfo?.filename || 'Unknown dataset',
    target_column: targetColumn,
    task_type: analysisData.task_type || taskType,
    evaluation_settings: {
      test_size: testSize,
      random_state: randomState,
      use_cross_validation: useCrossValidation,
      cv_folds: cvFolds,
    },
    preprocessing_settings: preprocessingSettings,
    selected_model: 'Feature analysis',
    accuracy: 0,
    total_rows: datasetInfo?.row_count || 0,
    training_rows: 0,
    testing_rows: 0,
    feature_columns: featureColumns,
    best_model: compareResult?.best_model || null,
    comparison_results: compareResult?.results || null,
    recommendation: compareResult?.recommendation || null,
    tuning_result: tuningResult || null,
    feature_analysis: analysisData,
    prediction_result: predictionResult || null,
  })

  const resetExperimentAfterFileChange = () => {
    setDatasetInfo(null)
    setTargetColumn('')
    setTargetMessage('')
    setDatasetInsights(null)
    setInsightsError('')
    setFeatureAnalysis(null)
    setFeatureAnalysisError('')
    setTaskType('classification')
    setSelectedModel('')
    setTrainingError('')
    setTrainingResult(null)
    setTuningModel('')
    setTuningError('')
    setTuningResult(null)
    setPredictionInputs({})
    setPredictionError('')
    setPredictionResult(null)
    setImportedModelInfo(null)
    setModelFile(null)
    setModelImportMessage('')
    setModelImportError('')
    setModelExportMessage('')
    setModelExportError('')
    setModelPortability(null)
    setCompareError('')
    setCompareResult(null)
    setReportMessage('')
    setReportError('')
    setCurrentExperimentId('')
  }

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0])
    resetExperimentAfterFileChange()
    setUploadSuccess('')
    setError('')
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a CSV file first.')
      return
    }

    const formData = new FormData()
    formData.append('file', selectedFile)

    setLoading(true)
    setError('')
    setUploadSuccess('')

    try {
      const response = await apiFetch('/upload', {
        method: 'POST',
        body: formData,
      })
      if (!response.ok) {
        throw new Error(await getApiErrorMessage(response, 'Dataset upload failed.'))
      }

      const data = await response.json()

      resetExperimentAfterFileChange()
      setDatasetInfo(data)
      setUploadSuccess('Dataset uploaded successfully. You can now select a target column.')
    } catch (uploadError) {
      setError(cleanErrorMessage(uploadError, 'Dataset upload failed.'))
      resetExperimentAfterFileChange()
    } finally {
      setLoading(false)
    }
  }

  const handleTargetChange = (event) => {
    setTargetColumn(event.target.value)
    setTargetMessage('')
    setDatasetInsights(null)
    setInsightsError('')
    setFeatureAnalysis(null)
    setFeatureAnalysisError('')
    setTaskType(detectFrontendTaskType(event.target.value))
    setSelectedModel('')
    setTrainingError('')
    setTrainingResult(null)
    setTuningModel('')
    setTuningError('')
    setTuningResult(null)
    setPredictionInputs({})
    setPredictionError('')
    setPredictionResult(null)
    setCompareError('')
    setCompareResult(null)
    setFeatureAnalysis(null)
    setFeatureAnalysisError('')
    setReportMessage('')
    setReportError('')
    setCurrentExperimentId('')
  }

  const detectFrontendTaskType = (columnName) => {
    if (!datasetInfo || !columnName) return 'classification'

    const values = datasetInfo.preview
      .map((row) => row[columnName])
      .filter((value) => value !== null && value !== undefined && String(value).trim() !== '')

    if (values.length === 0) return 'classification'

    const numericValues = values.filter((value) => !Number.isNaN(Number(value)))
    const uniqueValues = new Set(values.map((value) => String(value))).size

    if (numericValues.length === values.length && uniqueValues > 5) {
      return 'regression'
    }

    return numericValues.length === values.length && columnName.toLowerCase().includes('mark')
      ? 'regression'
      : 'classification'
  }

  const handleTaskTypeChange = (newTaskType) => {
    setTaskType(newTaskType)
    setSelectedModel('')
    setTrainingError('')
    setTrainingResult(null)
    setTuningModel('')
    setTuningError('')
    setTuningResult(null)
    setCompareError('')
    setCompareResult(null)
    setPredictionInputs({})
    setPredictionError('')
    setPredictionResult(null)
    setReportMessage('')
    setReportError('')
    setCurrentExperimentId('')
  }

  const handlePreprocessingSettingChange = (settingName, value) => {
    setPreprocessingSettings((currentSettings) => ({
      ...currentSettings,
      [settingName]: value,
    }))
    setTrainingResult(null)
    setCompareResult(null)
    setTuningResult(null)
    setFeatureAnalysis(null)
    setPredictionInputs({})
    setPredictionResult(null)
    setReportMessage('')
    setReportError('')
    setCurrentExperimentId('')
  }

  const handleContinue = () => {
    setTargetMessage('Target column selected. Continue with dataset analysis or model training.')
    document.getElementById('insights')?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleAnalyzeDataset = async () => {
    if (!datasetInfo || !targetColumn) {
      setInsightsError('Please upload a dataset and select a target column first.')
      return
    }

    setInsightsLoading(true)
    setInsightsError('')

    try {
      const response = await apiFetch('/dataset-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: datasetInfo.filename,
          target_column: targetColumn,
          task_type: taskType,
          preprocessing_settings: preprocessingSettings,
        }),
      })
      if (!response.ok) {
        throw new Error(await getApiErrorMessage(response, 'Dataset analysis failed.'))
      }

      const data = await response.json()

      setDatasetInsights(data)
    } catch (insightError) {
      setInsightsError(cleanErrorMessage(insightError, 'Dataset analysis failed.'))
    } finally {
      setInsightsLoading(false)
    }
  }

  const handleFeatureAnalysis = async () => {
    if (!datasetInfo || !targetColumn || !taskType) {
      setFeatureAnalysisError('Please upload a dataset, select a target column, and choose a task type first.')
      return
    }

    setFeatureAnalysisLoading(true)
    setFeatureAnalysisError('')
    setFeatureAnalysis(null)

    try {
      const response = await apiFetch('/feature-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: datasetInfo.filename,
          target_column: targetColumn,
          task_type: taskType,
          preprocessing_settings: preprocessingSettings,
        }),
      })

      if (!response.ok) {
        throw new Error(await getApiErrorMessage(response, 'Feature analysis failed.'))
      }

      const data = await response.json()

      setFeatureAnalysis(data)

      if (currentExperimentId) {
        updateSavedExperiment(currentExperimentId, {
          feature_analysis: data,
        })
      } else {
        const savedExperiment = buildFeatureAnalysisHistoryRecord(data, new Date())
        saveExperimentHistory([savedExperiment, ...experimentHistory])
        setCurrentExperimentId(savedExperiment.experiment_id)
      }
    } catch (analysisError) {
      setFeatureAnalysisError(cleanErrorMessage(analysisError, 'Feature analysis failed.'))
    } finally {
      setFeatureAnalysisLoading(false)
    }
  }

  const handleModelChange = (event) => {
    setSelectedModel(event.target.value)
    setTrainingError('')
    setTrainingResult(null)
    setPredictionInputs({})
    setPredictionError('')
    setPredictionResult(null)
    setReportMessage('')
    setReportError('')
    setCurrentExperimentId('')
  }

  const handleTuningModelChange = (event) => {
    setTuningModel(event.target.value)
    setTuningError('')
    setTuningResult(null)
    setReportMessage('')
    setReportError('')
  }

  const handleTrainModel = async () => {
    if (!datasetInfo || !targetColumn || !selectedModel) {
      setTrainingError('Please upload a CSV, select a target column, and choose a model.')
      return
    }

    setTraining(true)
    setTrainingError('')
    setTrainingResult(null)

    try {
      const response = await apiFetch('/train', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: datasetInfo.filename,
          target_column: targetColumn,
          model_name: selectedModel,
          task_type: taskType,
          preprocessing_settings: preprocessingSettings,
          test_size: testSize,
          random_state: Number(randomState),
          use_cross_validation: useCrossValidation,
          cv_folds: Number(cvFolds),
        }),
      })
      if (!response.ok) {
        throw new Error(await getApiErrorMessage(response, 'Training failed.'))
      }

      const data = await response.json()

      setTrainingResult(data)
      const savedExperiment = buildExperimentRecord(data, new Date())
      saveExperimentHistory([savedExperiment, ...experimentHistory])
      setCurrentExperimentId(savedExperiment.experiment_id)
      setPredictionInputs(
        data.feature_columns.reduce((values, column) => {
          values[column] = ''
          return values
        }, {})
      )
      setPredictionError('')
      setPredictionResult(null)
    } catch (trainError) {
      setTrainingError(cleanErrorMessage(trainError, 'Training failed.'))
    } finally {
      setTraining(false)
    }
  }

  const handleTuneModel = async () => {
    if (!datasetInfo || !targetColumn || !tuningModel) {
      setTuningError('Please upload a CSV, select a target column, and choose a model to tune.')
      return
    }

    setTuning(true)
    setTuningError('')
    setTuningResult(null)

    try {
      const response = await apiFetch('/tune-model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: datasetInfo.filename,
          target_column: targetColumn,
          model_name: tuningModel,
          task_type: taskType,
          preprocessing_settings: preprocessingSettings,
        }),
      })
      if (!response.ok) {
        throw new Error(await getApiErrorMessage(response, 'Hyperparameter tuning failed.'))
      }

      const data = await response.json()

      setTuningResult(data)

      if (currentExperimentId) {
        updateSavedExperiment(currentExperimentId, {
          tuning_result: data,
        })
      } else {
        const savedExperiment = buildTuningHistoryRecord(data, new Date())
        saveExperimentHistory([savedExperiment, ...experimentHistory])
        setCurrentExperimentId(savedExperiment.experiment_id)
      }
    } catch (tuneError) {
      setTuningError(cleanErrorMessage(tuneError, 'Hyperparameter tuning failed.'))
    } finally {
      setTuning(false)
    }
  }

  const handleCompareModels = async () => {
    if (!datasetInfo || !targetColumn) {
      setCompareError('Please upload a CSV and select a target column first.')
      return
    }

    setComparing(true)
    setCompareError('')
    setCompareResult(null)

    try {
      const response = await apiFetch('/compare-models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: datasetInfo.filename,
          target_column: targetColumn,
          task_type: taskType,
          preprocessing_settings: preprocessingSettings,
          use_cross_validation: useCrossValidation,
          cv_folds: Number(cvFolds),
        }),
      })
      if (!response.ok) {
        throw new Error(await getApiErrorMessage(response, 'Model comparison failed.'))
      }

      const data = await response.json()

      setCompareResult(data)
      updateSavedExperiment(currentExperimentId, {
        best_model: data.best_model,
        comparison_results: data.results,
        recommendation: data.recommendation,
      })
    } catch (compareModelsError) {
      setCompareError(cleanErrorMessage(compareModelsError, 'Model comparison failed.'))
    } finally {
      setComparing(false)
    }
  }

  const handlePredictionInputChange = (column, value) => {
    setPredictionInputs((currentInputs) => ({
      ...currentInputs,
      [column]: value,
    }))
    setPredictionError('')
    setPredictionResult(null)
  }

  const handlePredict = async () => {
    const activeModelId = trainingResult?.model_id || importedModelInfo?.model_id

    if (!activeModelId) {
      setPredictionError('Please train or import a model before making a prediction.')
      return
    }

    setPredicting(true)
    setPredictionError('')
    setPredictionResult(null)

    try {
      const response = await apiFetch('/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model_id: activeModelId,
          input_data: predictionInputs,
        }),
      })
      if (!response.ok) {
        throw new Error(await getApiErrorMessage(response, 'Prediction failed.'))
      }

      const data = await response.json()

      setPredictionResult(data)
      updateSavedExperiment(currentExperimentId, {
        prediction_result: data,
      })
    } catch (predictError) {
      setPredictionError(cleanErrorMessage(predictError, 'Prediction failed.'))
    } finally {
      setPredicting(false)
    }
  }

  const handleExportModel = async () => {
    if (!trainingResult?.model_id) {
      setModelExportError('Please train a model before exporting it.')
      return
    }

    setExportingModel(true)
    setModelExportMessage('')
    setModelExportError('')

    try {
      const response = await apiFetch(`/export-model/${trainingResult.model_id}`, {
        method: 'GET',
      })

      if (!response.ok) {
        throw new Error(await getApiErrorMessage(response, 'Model export failed.'))
      }

      const modelBlob = await response.blob()
      const modelUrl = URL.createObjectURL(modelBlob)
      const downloadLink = document.createElement('a')
      downloadLink.href = modelUrl
      downloadLink.download = 'AI-Playground-trained-model.joblib'
      document.body.appendChild(downloadLink)
      downloadLink.click()
      downloadLink.remove()
      URL.revokeObjectURL(modelUrl)

      const portability = {
        exported: true,
        exported_model_id: trainingResult.model_id,
        exported_model_name: trainingResult.model_name,
      }
      setModelPortability(portability)
      updateSavedExperiment(currentExperimentId, {
        model_portability: portability,
      })
      setModelExportMessage('Model exported successfully.')
    } catch (exportError) {
      setModelExportError(cleanErrorMessage(exportError, 'Model export failed.'))
    } finally {
      setExportingModel(false)
    }
  }

  const handleModelFileChange = (event) => {
    setModelFile(event.target.files[0])
    setModelImportMessage('')
    setModelImportError('')
  }

  const handleImportModel = async () => {
    if (!modelFile) {
      setModelImportError('Please select a .joblib model file first.')
      return
    }

    const formData = new FormData()
    formData.append('file', modelFile)

    setImportingModel(true)
    setModelImportMessage('')
    setModelImportError('')

    try {
      const response = await apiFetch('/import-model', {
        method: 'POST',
        body: formData,
      })
      if (!response.ok) {
        throw new Error(await getApiErrorMessage(response, 'Model import failed.'))
      }

      const data = await response.json()

      setImportedModelInfo(data)
      setPredictionInputs(
        data.feature_columns.reduce((values, column) => {
          values[column] = ''
          return values
        }, {})
      )
      setPredictionResult(null)

      const portability = {
        imported: true,
        imported_model_id: data.model_id,
        imported_filename: data.filename,
        imported_model_name: data.model_name,
      }
      setModelPortability(portability)
      updateSavedExperiment(currentExperimentId, {
        model_portability: portability,
      })
      setModelImportMessage('Model imported successfully. You can now use it for prediction.')
    } catch (importError) {
      setModelImportError(cleanErrorMessage(importError, 'Model import failed.'))
    } finally {
      setImportingModel(false)
    }
  }

  const handleDownloadReport = async () => {
    if (!trainingResult) {
      setReportError('Please train a model before downloading a report.')
      return
    }

    setReportLoading(true)
    setReportMessage('')
    setReportError('')

    const reportData = {
      filename: datasetInfo?.filename,
      target_column: targetColumn,
      task_type: trainingResult.task_type || taskType,
      evaluation_settings: {
        test_size: testSize,
        random_state: Number(randomState),
        use_cross_validation: useCrossValidation,
        cv_folds: Number(cvFolds),
      },
      selected_model: trainingResult.model_name,
      accuracy: trainingResult.accuracy,
      r2_score: trainingResult.r2_score,
      mean_absolute_error: trainingResult.mean_absolute_error,
      mean_squared_error: trainingResult.mean_squared_error,
      root_mean_squared_error: trainingResult.root_mean_squared_error,
      cv_scores: trainingResult.cv_scores,
      cv_mean_score: trainingResult.cv_mean_score,
      cv_std_score: trainingResult.cv_std_score,
      cv_folds: trainingResult.cv_folds,
      total_rows: trainingResult.total_rows,
      training_rows: trainingResult.training_rows,
      testing_rows: trainingResult.testing_rows,
      feature_columns: trainingResult.feature_columns,
      dataset_insights: datasetInsights || {
        filename: datasetInfo?.filename,
        rows: datasetInfo?.row_count,
        columns: datasetInfo?.column_count,
        column_names: datasetInfo?.columns?.join(', '),
      },
      feature_analysis: featureAnalysis,
      preprocessing_summary: {
        preprocessing_settings_used: trainingResult.preprocessing_settings_used || preprocessingSettings,
        rows_before_cleaning: trainingResult.rows_before_cleaning,
        rows_after_cleaning: trainingResult.rows_after_cleaning,
        duplicate_rows_removed: trainingResult.duplicate_rows_removed,
        constant_columns_removed: trainingResult.constant_columns_removed,
        numeric_missing_strategy: trainingResult.numeric_missing_strategy,
        categorical_missing_strategy: trainingResult.categorical_missing_strategy,
        scale_numeric: trainingResult.scale_numeric,
        encoding_strategy: trainingResult.encoding_strategy,
      },
      confusion_matrix: trainingResult.confusion_matrix,
      class_labels: trainingResult.class_labels,
      classification_report: trainingResult.classification_report,
      comparison_results: compareResult?.results || null,
      best_model: compareResult?.best_model || null,
      recommendation: compareResult?.recommendation || null,
      tuning_result: tuningResult,
      prediction_result: predictionResult,
      model_portability: modelPortability,
    }

    try {
      const response = await apiFetch('/download-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData),
      })

      if (!response.ok) {
        throw new Error(await getApiErrorMessage(response, 'Report generation failed.'))
      }

      const reportBlob = await response.blob()
      const reportUrl = URL.createObjectURL(reportBlob)
      const downloadLink = document.createElement('a')
      downloadLink.href = reportUrl
      downloadLink.download = 'AI-Playground-Experiment-Report.pdf'
      document.body.appendChild(downloadLink)
      downloadLink.click()
      downloadLink.remove()
      URL.revokeObjectURL(reportUrl)
      setReportMessage('Report downloaded successfully.')
    } catch (reportDownloadError) {
      setReportError(cleanErrorMessage(reportDownloadError, 'Report generation failed.'))
    } finally {
      setReportLoading(false)
    }
  }

  const featureColumns = datasetInfo
    ? datasetInfo.columns.filter((column) => column !== targetColumn)
    : []

  const availableModels =
    taskType === 'regression' ? regressionModelOptions : modelOptions

  const chartData = compareResult
    ? compareResult.results.map((result) => ({
        model: result.model_name,
        score:
          compareResult.use_cross_validation
            ? taskType === 'regression'
              ? Number(result.cv_mean_score.toFixed(4))
              : Number((result.cv_mean_score * 100).toFixed(2))
            : taskType === 'regression'
            ? Number(result.r2_score.toFixed(2))
            : Number((result.accuracy * 100).toFixed(2)),
      }))
    : []

  const featureImportanceChartData = featureAnalysis
    ? featureAnalysis.important_features.slice(0, 8).map((feature) => ({
        feature: feature.feature_name,
        importance: feature.importance_score,
      }))
    : []

  const cvChartData = trainingResult?.cv_scores
    ? trainingResult.cv_scores.map((score, index) => ({
        fold: `Fold ${index + 1}`,
        score:
          trainingResult.task_type === 'regression'
            ? Number(score.toFixed(4))
            : Number((score * 100).toFixed(2)),
      }))
    : []

  const strongestPositiveCorrelation = featureAnalysis?.correlation_insights?.reduce(
    (best, insight) =>
      !best || insight.correlation_value > best.correlation_value ? insight : best,
    null
  )

  const strongestNegativeCorrelation = featureAnalysis?.correlation_insights?.reduce(
    (best, insight) =>
      !best || insight.correlation_value < best.correlation_value ? insight : best,
    null
  )

  const reportRows = trainingResult?.classification_report
    ? Object.entries(trainingResult.classification_report).filter(
        ([label]) => label !== 'accuracy'
      )
    : []

  const predictionReady =
    Boolean(trainingResult?.model_id || importedModelInfo?.model_id) &&
    (trainingResult?.feature_columns || importedModelInfo?.feature_columns || []).every(
      (column) => String(predictionInputs[column] ?? '').trim() !== ''
    )

  const formatMetric = (value) =>
    typeof value === 'number' ? value.toFixed(2) : value

  const formatAccuracy = (accuracy) =>
    typeof accuracy === 'number' ? `${(accuracy * 100).toFixed(2)}%` : 'Not available'

  const formatScore = (value) =>
    typeof value === 'number' ? value.toFixed(4) : 'Not available'

  const formatCvScore = (value, currentTaskType = taskType) =>
    currentTaskType === 'regression' ? formatScore(value) : formatAccuracy(value)

  const getComparisonScore = (result) =>
    compareResult?.use_cross_validation
      ? result.cv_mean_score
      : compareResult?.task_type === 'regression'
        ? result.r2_score
        : result.accuracy

  const bestSavedExperiment = experimentHistory.reduce((bestExperiment, experiment) => {
    if (!bestExperiment || experiment.accuracy > bestExperiment.accuracy) {
      return experiment
    }

    return bestExperiment
  }, null)

  const mostRecentExperiment = experimentHistory[0]

  const toggleExperimentDetails = (experimentId) => {
    setExpandedExperimentId((currentId) =>
      currentId === experimentId ? '' : experimentId
    )
  }

  const deleteExperiment = (experimentId) => {
    const updatedHistory = experimentHistory.filter(
      (experiment) => experiment.experiment_id !== experimentId
    )
    saveExperimentHistory(updatedHistory)

    if (expandedExperimentId === experimentId) {
      setExpandedExperimentId('')
    }

    if (currentExperimentId === experimentId) {
      setCurrentExperimentId('')
    }
  }

  const clearExperimentHistory = () => {
    saveExperimentHistory([])
    setExpandedExperimentId('')
    setCurrentExperimentId('')
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar onOpenAbout={() => setShowAboutModal(true)} />
      <HeroSection />
      <WorkflowOverview />

      <main className="mx-auto grid max-w-7xl gap-8 px-6 py-10">
        <StepCard
          id="upload"
          title="Upload Dataset"
          description="Start by uploading a CSV file. The platform saves it on the backend and shows a quick preview."
          icon={Upload}
        >
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
            <label className="block text-sm font-semibold text-slate-700">
              CSV file
              <input
                type="file"
                accept=".csv"
                className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-950 file:px-4 file:py-2 file:text-sm file:font-bold file:text-white hover:file:bg-slate-800"
                onChange={handleFileChange}
              />
            </label>
            <PrimaryButton icon={Upload} onClick={handleUpload} disabled={loading}>
              {loading ? 'Uploading...' : 'Upload Dataset'}
            </PrimaryButton>
          </div>

          <div className="mt-5 grid gap-3">
            {!datasetInfo && !loading && (
              <EmptyState>
                Upload `student_performance.csv` or any classification CSV to begin.
              </EmptyState>
            )}
            {loading && <LoadingState>Uploading dataset...</LoadingState>}
            {uploadSuccess && <SuccessAlert>{uploadSuccess}</SuccessAlert>}
            {error && <ErrorAlert>{error}</ErrorAlert>}
          </div>

          {datasetInfo && (
            <div className="mt-8 grid gap-6">
              <div className="grid gap-4 md:grid-cols-3">
                <MetricCard label="File name" value={datasetInfo.filename} />
                <MetricCard label="Rows" value={datasetInfo.row_count} />
                <MetricCard label="Columns" value={datasetInfo.column_count} />
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <h3 className="font-bold text-slate-950">Column names</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {datasetInfo.columns.map((column) => (
                    <span
                      key={column}
                      className="rounded-lg bg-white px-3 py-1 text-sm font-semibold text-cyan-800 ring-1 ring-cyan-100"
                    >
                      {column}
                    </span>
                  ))}
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-200">
                <div className="bg-slate-50 px-5 py-4">
                  <h3 className="font-bold text-slate-950">Dataset preview</h3>
                  <p className="mt-1 text-sm text-slate-600">First five rows from the uploaded CSV.</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-100">
                      <tr>
                        {datasetInfo.columns.map((column) => (
                          <th key={column} className="px-4 py-3 text-left font-bold text-slate-700">
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {datasetInfo.preview.map((row, rowIndex) => (
                        <tr key={rowIndex} className="odd:bg-white even:bg-slate-50">
                          {datasetInfo.columns.map((column) => (
                            <td key={column} className="px-4 py-3 text-slate-700">
                              {row[column] === null ? 'Empty' : String(row[column])}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </StepCard>

        <StepCard
          id="target"
          title="Select Target Column"
          description="Choose the output column that the model should learn to predict."
          icon={Target}
        >
          {!datasetInfo ? (
            <EmptyState>Upload a dataset first so the target column dropdown can be filled.</EmptyState>
          ) : (
            <>
              <label className="block text-sm font-semibold text-slate-700">
                Target column
                <select
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                  value={targetColumn}
                  onChange={handleTargetChange}
                >
                  <option value="">Select a target column</option>
                  {datasetInfo.columns.map((column) => (
                    <option key={column} value={column}>
                      {column}
                    </option>
                  ))}
                </select>
              </label>

              <div className="mt-5">
                <AccentButton icon={Target} onClick={handleContinue} disabled={!targetColumn}>
                  Confirm Target Column
                </AccentButton>
              </div>

              {targetMessage && <div className="mt-4"><SuccessAlert>{targetMessage}</SuccessAlert></div>}

              {targetColumn && (
                <div className="mt-6 grid gap-4 lg:grid-cols-2">
                  <MetricCard label="Selected target" value={targetColumn} highlight />
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-sm font-semibold text-slate-700">Feature columns</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {featureColumns.map((column) => (
                        <span key={column} className="rounded-lg bg-white px-3 py-1 text-sm font-semibold text-slate-700 ring-1 ring-slate-200">
                          {column}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </StepCard>

        <StepCard
          id="task"
          title="Select ML Task Type"
          description="Choose whether your model should predict categories or numeric values."
          icon={SlidersHorizontal}
        >
          {!targetColumn ? (
            <EmptyState>Select a target column first so the task type can be suggested.</EmptyState>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  {
                    value: 'classification',
                    title: 'Classification',
                    description: 'Predicts categories like Pass/Fail, Yes/No, or disease type.',
                  },
                  {
                    value: 'regression',
                    title: 'Regression',
                    description: 'Predicts numbers like marks, price, salary, sales, or score.',
                  },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleTaskTypeChange(option.value)}
                    className={`rounded-2xl border p-5 text-left transition ${
                      taskType === option.value
                        ? 'border-cyan-300 bg-cyan-50 shadow-lg shadow-cyan-100/60'
                        : 'border-slate-200 bg-slate-50 hover:border-cyan-200 hover:bg-white'
                    }`}
                  >
                    <p className="text-lg font-bold text-slate-950">{option.title}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{option.description}</p>
                  </button>
                ))}
              </div>
              <div className="mt-5">
                <Alert type="info">
                  Suggested task type: {taskType === 'regression' ? 'Regression' : 'Classification'}.
                  You can change it manually if your numeric target is actually a category.
                </Alert>
              </div>
            </>
          )}
        </StepCard>

        <StepCard
          id="insights"
          title="Analyze Dataset"
          description="Review useful dataset details before training, including missing values and column types."
          icon={Database}
        >
          <AccentButton icon={Activity} onClick={handleAnalyzeDataset} disabled={!datasetInfo || !targetColumn || insightsLoading}>
            {insightsLoading ? 'Analyzing...' : 'Analyze Dataset'}
          </AccentButton>

          <div className="mt-5">
            {!targetColumn && <EmptyState>Select a target column before analyzing the dataset.</EmptyState>}
            {insightsLoading && <LoadingState>Analyzing dataset...</LoadingState>}
            {insightsError && <ErrorAlert>{insightsError}</ErrorAlert>}
          </div>

          {datasetInsights && (
            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <MetricCard label="Rows" value={datasetInsights.row_count} />
              <MetricCard label="Columns" value={datasetInsights.column_count} />
              <MetricCard label="Numeric columns" value={datasetInsights.numeric_columns?.length ?? 0} />
              <MetricCard label="Categorical columns" value={datasetInsights.categorical_columns?.length ?? 0} />
            </div>
          )}
        </StepCard>

        <StepCard
          id="preprocessing"
          title="Preprocessing Settings"
          description="Preprocessing prepares your dataset before model training. These settings help clean missing values, remove unnecessary columns, and transform data into a model-ready format."
          icon={SlidersHorizontal}
        >
          <div className="mb-5 inline-flex rounded-full bg-cyan-50 px-4 py-2 text-sm font-bold text-cyan-800 ring-1 ring-cyan-100">
            Recommended defaults are already selected
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[
              ['remove_duplicates', 'Remove duplicate rows'],
              ['remove_constant_columns', 'Remove constant columns'],
              ['scale_numeric', 'Scale numeric features'],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                <input
                  type="checkbox"
                  className="h-5 w-5 rounded border-slate-300 text-cyan-600"
                  checked={Boolean(preprocessingSettings[key])}
                  onChange={(event) => handlePreprocessingSettingChange(key, event.target.checked)}
                />
                {label}
              </label>
            ))}

            <label className="block text-sm font-semibold text-slate-700">
              Numeric missing values
              <select
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                value={preprocessingSettings.numeric_missing_strategy}
                onChange={(event) => handlePreprocessingSettingChange('numeric_missing_strategy', event.target.value)}
              >
                <option value="mean">Fill with mean</option>
                <option value="median">Fill with median</option>
                <option value="zero">Fill with zero</option>
              </select>
            </label>

            <label className="block text-sm font-semibold text-slate-700">
              Categorical missing values
              <select
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                value={preprocessingSettings.categorical_missing_strategy}
                onChange={(event) => handlePreprocessingSettingChange('categorical_missing_strategy', event.target.value)}
              >
                <option value="mode">Fill with mode</option>
                <option value="unknown">Fill with Unknown</option>
              </select>
            </label>

            <label className="block text-sm font-semibold text-slate-700">
              Categorical encoding
              <select
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                value={preprocessingSettings.encoding_strategy}
                onChange={(event) => handlePreprocessingSettingChange('encoding_strategy', event.target.value)}
              >
                <option value="onehot">One-hot encoding</option>
                <option value="label">Label encoding</option>
              </select>
            </label>
          </div>
        </StepCard>

        <StepCard
          id="feature-insights"
          title="Feature Insights"
          description="Feature insights help you understand which columns influence the prediction most."
          icon={BarChart3}
        >
          <AccentButton
            icon={Sparkles}
            onClick={handleFeatureAnalysis}
            disabled={!datasetInfo || !targetColumn || !taskType || featureAnalysisLoading}
          >
            {featureAnalysisLoading ? 'Analyzing feature importance...' : 'Analyze Feature Importance'}
          </AccentButton>

          <div className="mt-5">
            {!targetColumn && <EmptyState>Select a target column before analyzing feature importance.</EmptyState>}
            {featureAnalysisLoading && <LoadingState>Analyzing feature importance...</LoadingState>}
            {featureAnalysisError && <ErrorAlert>{featureAnalysisError}</ErrorAlert>}
          </div>

          {featureAnalysis && (
            <div className="mt-8 grid gap-6">
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <div className="bg-slate-50 px-5 py-4">
                    <h3 className="font-bold text-slate-950">Top important features</h3>
                    <p className="mt-1 text-sm text-slate-600">Higher scores had more influence in the random forest model.</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 text-sm">
                      <thead className="bg-slate-100">
                        <tr>
                          <th className="px-4 py-3 text-left font-bold text-slate-700">Feature</th>
                          <th className="px-4 py-3 text-left font-bold text-slate-700">Importance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {featureAnalysis.important_features.map((feature) => (
                          <tr key={feature.feature_name} className="odd:bg-white even:bg-slate-50">
                            <td className="px-4 py-3 font-semibold text-slate-800">{feature.feature_name}</td>
                            <td className="px-4 py-3 text-slate-700">{formatScore(feature.importance_score)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                  <h3 className="font-bold text-slate-950">Feature importance chart</h3>
                  <p className="mt-1 text-sm text-slate-600">Top features ranked by model-based importance.</p>
                  <div className="mt-4 h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={featureImportanceChartData} margin={{ left: 0, right: 16 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="feature" tick={{ fill: '#475569', fontSize: 12 }} interval={0} angle={-15} textAnchor="end" height={70} />
                        <YAxis tick={{ fill: '#475569', fontSize: 12 }} />
                        <Tooltip formatter={(value) => [value, 'Importance']} />
                        <Bar dataKey="importance" fill="#06b6d4" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Alert type="info">{featureAnalysis.explanation}</Alert>
                <Alert type="info">{featureAnalysis.caution}</Alert>
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-200">
                <div className="bg-slate-50 px-5 py-4">
                  <h3 className="font-bold text-slate-950">Correlation insights</h3>
                  <p className="mt-1 text-sm text-slate-600">{featureAnalysis.correlation_message}</p>
                </div>
                {featureAnalysis.correlation_insights.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 text-sm">
                      <thead className="bg-slate-100">
                        <tr>
                          <th className="px-4 py-3 text-left font-bold text-slate-700">Feature</th>
                          <th className="px-4 py-3 text-left font-bold text-slate-700">Correlation</th>
                          <th className="px-4 py-3 text-left font-bold text-slate-700">Note</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {featureAnalysis.correlation_insights.map((insight) => (
                          <tr key={insight.feature_name} className="odd:bg-white even:bg-slate-50">
                            <td className="px-4 py-3 font-semibold text-slate-800">{insight.feature_name}</td>
                            <td className="px-4 py-3 text-slate-700">{formatScore(insight.correlation_value)}</td>
                            <td className="px-4 py-3 text-slate-700">
                              {insight.feature_name === strongestPositiveCorrelation?.feature_name && 'Strongest positive'}
                              {insight.feature_name === strongestNegativeCorrelation?.feature_name && insight.feature_name !== strongestPositiveCorrelation?.feature_name && 'Strongest negative'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-5">
                    <EmptyState>{featureAnalysis.correlation_message}</EmptyState>
                  </div>
                )}
              </div>
            </div>
          )}
        </StepCard>

        <StepCard
          id="evaluation-settings"
          title="Evaluation Settings"
          description="Control how the dataset is split and optionally enable cross-validation for a more reliable estimate."
          icon={SlidersHorizontal}
        >
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <label className="block text-sm font-semibold text-slate-700">
              Test size
              <select
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                value={testSize}
                onChange={(event) => setTestSize(Number(event.target.value))}
              >
                <option value={0.1}>10%</option>
                <option value={0.2}>20%</option>
                <option value={0.3}>30%</option>
                <option value={0.4}>40%</option>
              </select>
            </label>

            <label className="block text-sm font-semibold text-slate-700">
              Random state
              <input
                type="number"
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                value={randomState}
                onChange={(event) => setRandomState(event.target.value)}
              />
            </label>

            <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 lg:mt-7">
              <input
                type="checkbox"
                className="h-5 w-5 rounded border-slate-300 text-cyan-600"
                checked={useCrossValidation}
                onChange={(event) => setUseCrossValidation(event.target.checked)}
              />
              Enable cross-validation
            </label>

            <label className="block text-sm font-semibold text-slate-700">
              CV folds
              <select
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 disabled:bg-slate-100"
                value={cvFolds}
                onChange={(event) => setCvFolds(Number(event.target.value))}
                disabled={!useCrossValidation}
              >
                <option value={3}>3</option>
                <option value={5}>5</option>
                <option value={10}>10</option>
              </select>
            </label>
          </div>

          <div className="mt-5">
            <Alert type="info">
              Cross-validation tests the model on multiple data splits and gives a more reliable performance estimate.
            </Alert>
          </div>
        </StepCard>

        <StepCard
          id="train"
          title="Train Model"
          description="Pick one classification algorithm and train it on the uploaded dataset."
          icon={Brain}
        >
          {!targetColumn ? (
            <EmptyState>Select a target column before training a model.</EmptyState>
          ) : (
            <>
              <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
                <label className="block text-sm font-semibold text-slate-700">
                  Machine learning model
                  <select
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                    value={selectedModel}
                    onChange={handleModelChange}
                  >
                    <option value="">Select an ML model</option>
                    {availableModels.map((model) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                  </select>
                </label>
                <PrimaryButton icon={Brain} onClick={handleTrainModel} disabled={!datasetInfo || !targetColumn || !selectedModel || training}>
                  {training ? 'Training model...' : 'Train Model'}
                </PrimaryButton>
              </div>

              <div className="mt-5">
                {training && <LoadingState>Training model...</LoadingState>}
                {trainingError && <ErrorAlert>{trainingError}</ErrorAlert>}
              </div>
            </>
          )}

          {trainingResult && (
            <div className="mt-8 grid gap-6">
              <SuccessAlert>Training completed successfully.</SuccessAlert>
              <div className="grid gap-4 md:grid-cols-3">
                <MetricCard label="Model" value={trainingResult.model_name} />
                <MetricCard label="Target" value={trainingResult.target_column} />
                <MetricCard label="Task type" value={trainingResult.task_type} />
                {trainingResult.task_type === 'regression' ? (
                  <>
                    <MetricCard label="R2 score" value={formatScore(trainingResult.r2_score)} highlight />
                    <MetricCard label="Mean absolute error" value={formatScore(trainingResult.mean_absolute_error)} />
                    <MetricCard label="Mean squared error" value={formatScore(trainingResult.mean_squared_error)} />
                    <MetricCard label="Root mean squared error" value={formatScore(trainingResult.root_mean_squared_error)} />
                  </>
                ) : (
                  <MetricCard label="Accuracy" value={`${(trainingResult.accuracy * 100).toFixed(2)}%`} highlight />
                )}
                <MetricCard label="Total rows" value={trainingResult.total_rows} />
                <MetricCard label="Training rows" value={trainingResult.training_rows} />
                <MetricCard label="Testing rows" value={trainingResult.testing_rows} />
              </div>

              {trainingResult.preprocessing_settings_used && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                  <h3 className="text-lg font-bold text-slate-950">Preprocessing Applied</h3>
                  <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <MetricCard label="Rows before cleaning" value={trainingResult.rows_before_cleaning} />
                    <MetricCard label="Rows after cleaning" value={trainingResult.rows_after_cleaning} />
                    <MetricCard label="Duplicate rows removed" value={trainingResult.duplicate_rows_removed} />
                    <MetricCard label="Constant columns removed" value={trainingResult.constant_columns_removed?.length || 0} />
                    <MetricCard label="Numeric missing strategy" value={trainingResult.numeric_missing_strategy} />
                    <MetricCard label="Categorical missing strategy" value={trainingResult.categorical_missing_strategy} />
                    <MetricCard label="Scaling" value={trainingResult.scale_numeric ? 'On' : 'Off'} />
                    <MetricCard label="Encoding" value={trainingResult.encoding_strategy} />
                  </div>
                </div>
              )}

              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-950">Export Trained Model</h3>
                    <p className="mt-1 text-sm text-slate-600">
                      Download the trained model and preprocessing bundle as a reusable .joblib file.
                    </p>
                  </div>
                  <PrimaryButton icon={Download} onClick={handleExportModel} disabled={!trainingResult.model_id || exportingModel}>
                    {exportingModel ? 'Exporting...' : 'Download Model'}
                  </PrimaryButton>
                </div>
                <div className="mt-4 grid gap-3">
                  {exportingModel && <LoadingState>Preparing model download...</LoadingState>}
                  {modelExportMessage && <SuccessAlert>{modelExportMessage}</SuccessAlert>}
                  {modelExportError && <ErrorAlert>{modelExportError}</ErrorAlert>}
                </div>
              </div>

              {trainingResult.task_type === 'classification' && (
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <h3 className="text-lg font-bold text-slate-950">Detailed Evaluation</h3>
                <p className="mt-1 text-sm text-slate-600">Confusion matrix and classification report for the selected model.</p>

                <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="px-4 py-3 text-left font-bold text-slate-700">Actual / Predicted</th>
                        {trainingResult.class_labels.map((label) => (
                          <th key={label} className="px-4 py-3 text-center font-bold text-slate-700">{label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {trainingResult.confusion_matrix.map((row, rowIndex) => (
                        <tr key={trainingResult.class_labels[rowIndex]} className="odd:bg-white even:bg-slate-50">
                          <td className="px-4 py-3 font-bold text-slate-800">{trainingResult.class_labels[rowIndex]}</td>
                          {row.map((value, columnIndex) => (
                            <td key={`${rowIndex}-${columnIndex}`} className="px-4 py-3 text-center text-slate-700">{value}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-5 grid gap-3 text-sm text-slate-600 md:grid-cols-3">
                  <p className="rounded-xl bg-slate-50 p-4">Precision tells how many predicted positives were actually correct.</p>
                  <p className="rounded-xl bg-slate-50 p-4">Recall tells how many actual positives were found correctly.</p>
                  <p className="rounded-xl bg-slate-50 p-4">F1-score balances precision and recall.</p>
                </div>

                <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-100">
                      <tr>
                        {['Class name', 'Precision', 'Recall', 'F1-score', 'Support'].map((heading) => (
                          <th key={heading} className="px-4 py-3 text-left font-bold text-slate-700">{heading}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {reportRows.map(([label, metrics]) => (
                        <tr key={label} className="odd:bg-white even:bg-slate-50">
                          <td className="px-4 py-3 font-semibold text-slate-800">{label}</td>
                          <td className="px-4 py-3 text-slate-700">{formatMetric(metrics.precision)}</td>
                          <td className="px-4 py-3 text-slate-700">{formatMetric(metrics.recall)}</td>
                          <td className="px-4 py-3 text-slate-700">{formatMetric(metrics['f1-score'])}</td>
                          <td className="px-4 py-3 text-slate-700">{metrics.support}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              )}

              {trainingResult.cv_scores && (
                <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-5">
                  <h3 className="text-lg font-bold text-slate-950">Cross-Validation Results</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {trainingResult.task_type === 'regression' ? 'R2 Score' : 'Accuracy'} across {trainingResult.cv_folds} folds.
                  </p>
                  <div className="mt-5 grid gap-4 md:grid-cols-3">
                    <MetricCard label="Mean CV score" value={formatCvScore(trainingResult.cv_mean_score, trainingResult.task_type)} highlight />
                    <MetricCard label="Standard deviation" value={formatScore(trainingResult.cv_std_score)} />
                    <MetricCard label="Folds" value={trainingResult.cv_folds} />
                  </div>
                  <div className="mt-5 rounded-xl border border-cyan-100 bg-white p-5">
                    <h4 className="font-bold text-slate-950">CV score chart</h4>
                    <div className="mt-4 h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={cvChartData} margin={{ left: 0, right: 16 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="fold" tick={{ fill: '#475569', fontSize: 12 }} />
                          <YAxis tick={{ fill: '#475569', fontSize: 12 }} tickFormatter={(value) => trainingResult.task_type === 'regression' ? value : `${value}%`} />
                          <Tooltip formatter={(value) => [trainingResult.task_type === 'regression' ? value : `${value}%`, trainingResult.task_type === 'regression' ? 'R2 Score' : 'Accuracy']} />
                          <Bar dataKey="score" fill="#0891b2" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {trainingResult.cv_scores.map((score, index) => (
                      <span key={index} className="rounded-lg bg-white px-3 py-1 text-sm font-semibold text-cyan-800 ring-1 ring-cyan-100">
                        Fold {index + 1}: {formatCvScore(score, trainingResult.task_type)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </StepCard>

        <StepCard
          id="tune"
          title="Hyperparameter Tuning"
          description="Hyperparameter tuning tests different model settings to find the best-performing configuration."
          icon={SlidersHorizontal}
        >
          {!targetColumn ? (
            <EmptyState>Select a target column before tuning a model.</EmptyState>
          ) : (
            <>
              <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
                <label className="block text-sm font-semibold text-slate-700">
                  Model to tune
                  <select
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                    value={tuningModel}
                    onChange={handleTuningModelChange}
                  >
                    <option value="">Select a model to tune</option>
                    {availableModels.map((model) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                  </select>
                </label>
                <AccentButton
                  icon={SlidersHorizontal}
                  onClick={handleTuneModel}
                  disabled={!datasetInfo || !targetColumn || !tuningModel || tuning}
                >
                  {tuning ? 'Tuning model...' : 'Tune Model'}
                </AccentButton>
              </div>

              <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                Tuning may take a few seconds depending on the dataset size.
              </p>

              <div className="mt-5">
                {tuning && <LoadingState>Tuning model...</LoadingState>}
                {tuningError && <ErrorAlert>{tuningError}</ErrorAlert>}
              </div>
            </>
          )}

          {tuningResult && (
            <div className="mt-8 grid gap-6">
              <SuccessAlert>{tuningResult.message}</SuccessAlert>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard label="Tuned model" value={tuningResult.model_name} />
                <MetricCard label="Target" value={tuningResult.target_column} />
                <MetricCard
                  label={tuningResult.task_type === 'regression' ? 'Tuned R2 score' : 'Tuned accuracy'}
                  value={tuningResult.task_type === 'regression' ? formatScore(tuningResult.tuned_accuracy) : formatAccuracy(tuningResult.tuned_accuracy)}
                  highlight
                />
                <MetricCard
                  label={tuningResult.task_type === 'regression' ? 'Original R2 score' : 'Original accuracy'}
                  value={tuningResult.task_type === 'regression' ? formatScore(tuningResult.original_accuracy) : formatAccuracy(tuningResult.original_accuracy)}
                />
              </div>

              <div className="rounded-2xl border border-cyan-200 bg-gradient-to-br from-cyan-50 to-white p-6">
                <h3 className="text-lg font-bold text-slate-950">Best parameters</h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {Object.entries(tuningResult.best_parameters).map(([parameter, value]) => (
                    <div key={parameter} className="rounded-xl border border-cyan-100 bg-white p-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        {parameter}
                      </p>
                      <p className="mt-1 text-lg font-bold text-slate-950">
                        {String(value)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </StepCard>

        <StepCard
          id="compare"
          title="Compare Models"
          description="Train all available models on the same dataset split and compare their accuracy."
          icon={BarChart3}
        >
          <AccentButton icon={LineChart} onClick={handleCompareModels} disabled={!datasetInfo || !targetColumn || comparing}>
            {comparing ? 'Comparing models...' : 'Compare All Models'}
          </AccentButton>
          <div className="mt-5">
            {!targetColumn && <EmptyState>Select a target column before comparing models.</EmptyState>}
            {comparing && <LoadingState>Comparing models...</LoadingState>}
            {compareError && <ErrorAlert>{compareError}</ErrorAlert>}
          </div>

          {compareResult && (
            <div className="mt-8 grid gap-6">
              <div className="rounded-2xl border border-green-200 bg-green-50 p-6">
                <p className="text-sm font-semibold text-green-700">Best model</p>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <h3 className="text-3xl font-bold text-slate-950">{compareResult.best_model.model_name}</h3>
                  <p className="text-4xl font-bold text-green-700">
                    {compareResult.use_cross_validation
                      ? formatCvScore(compareResult.best_model.cv_mean_score, compareResult.task_type)
                      : compareResult.task_type === 'regression'
                        ? formatScore(compareResult.best_model.r2_score)
                        : `${(compareResult.best_model.accuracy * 100).toFixed(2)}%`}
                  </p>
                </div>
              </div>

              {compareResult.recommendation && (
                <div className="rounded-2xl border border-cyan-200 bg-gradient-to-br from-cyan-50 to-white p-6 shadow-lg shadow-cyan-100/60">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <span className="inline-flex rounded-full bg-cyan-500 px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-950">
                        Best Choice
                      </span>
                      <h3 className="mt-4 text-3xl font-bold text-slate-950">
                        {compareResult.recommendation.recommended_model}
                      </h3>
                      <p className="mt-2 text-sm font-semibold text-cyan-700">
                        {compareResult.task_type === 'regression' ? 'R2 score' : 'Accuracy'}: {compareResult.task_type === 'regression' ? formatScore(compareResult.recommendation.recommended_accuracy) : formatAccuracy(compareResult.recommendation.recommended_accuracy)}
                      </p>
                    </div>
                    <div className="rounded-xl bg-slate-950 px-5 py-4 text-right text-white">
                      <p className="text-xs font-bold uppercase tracking-wide text-cyan-200">Recommended</p>
                      <p className="mt-1 text-2xl font-bold">
                        {compareResult.task_type === 'regression' ? formatScore(compareResult.recommendation.recommended_accuracy) : formatAccuracy(compareResult.recommendation.recommended_accuracy)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 lg:grid-cols-3">
                    <div className="rounded-xl border border-cyan-100 bg-white p-4">
                      <p className="text-sm font-bold text-slate-950">Reason</p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {compareResult.recommendation.reason}
                      </p>
                    </div>
                    <div className="rounded-xl border border-cyan-100 bg-white p-4">
                      <p className="text-sm font-bold text-slate-950">Suggestion</p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {compareResult.recommendation.suggestion}
                      </p>
                    </div>
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                      <p className="text-sm font-bold text-amber-900">Caution</p>
                      <p className="mt-2 text-sm leading-6 text-amber-800">
                        {compareResult.recommendation.caution}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="px-4 py-3 text-left font-bold text-slate-700">Model</th>
                        {compareResult.task_type === 'regression' ? (
                          <>
                            <th className="px-4 py-3 text-left font-bold text-slate-700">R2 score</th>
                            <th className="px-4 py-3 text-left font-bold text-slate-700">MAE</th>
                            <th className="px-4 py-3 text-left font-bold text-slate-700">MSE</th>
                            <th className="px-4 py-3 text-left font-bold text-slate-700">RMSE</th>
                          </>
                        ) : (
                          <th className="px-4 py-3 text-left font-bold text-slate-700">Accuracy</th>
                        )}
                        {compareResult.use_cross_validation && (
                          <>
                            <th className="px-4 py-3 text-left font-bold text-slate-700">CV mean</th>
                            <th className="px-4 py-3 text-left font-bold text-slate-700">CV std</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {compareResult.results.map((result) => (
                        <tr
                          key={result.model_name}
                          className={
                            getComparisonScore(result) === getComparisonScore(compareResult.best_model)
                              ? 'bg-cyan-50'
                              : 'odd:bg-white even:bg-slate-50'
                          }
                        >
                          <td className="px-4 py-3 font-semibold text-slate-800">
                            <span className="inline-flex items-center gap-2">
                              {result.model_name}
                              {getComparisonScore(result) === getComparisonScore(compareResult.best_model) && (
                                <span className="rounded-full bg-cyan-500 px-2 py-0.5 text-xs font-bold text-slate-950">
                                  Best
                                </span>
                              )}
                            </span>
                          </td>
                          {compareResult.task_type === 'regression' ? (
                            <>
                              <td className="px-4 py-3 font-semibold text-slate-700">{formatScore(result.r2_score)}</td>
                              <td className="px-4 py-3 text-slate-700">{formatScore(result.mean_absolute_error)}</td>
                              <td className="px-4 py-3 text-slate-700">{formatScore(result.mean_squared_error)}</td>
                              <td className="px-4 py-3 text-slate-700">{formatScore(result.root_mean_squared_error)}</td>
                            </>
                          ) : (
                            <td className="px-4 py-3 font-semibold text-slate-700">{(result.accuracy * 100).toFixed(2)}%</td>
                          )}
                          {compareResult.use_cross_validation && (
                            <>
                              <td className="px-4 py-3 font-semibold text-slate-700">{formatCvScore(result.cv_mean_score, compareResult.task_type)}</td>
                              <td className="px-4 py-3 text-slate-700">{formatScore(result.cv_std_score)}</td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                  <h3 className="font-bold text-slate-950">
                    {compareResult.task_type === 'regression' ? 'R2 score chart' : 'Accuracy chart'}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">Higher bars indicate stronger performance on the test split.</p>
                  <div className="mt-4 h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ left: 0, right: 16 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="model" tick={{ fill: '#475569', fontSize: 12 }} interval={0} angle={-15} textAnchor="end" height={70} />
                        <YAxis tick={{ fill: '#475569', fontSize: 12 }} tickFormatter={(value) => compareResult.task_type === 'regression' ? value : `${value}%`} />
                        <Tooltip formatter={(value) => [compareResult.task_type === 'regression' ? value : `${value}%`, compareResult.task_type === 'regression' ? 'R2 score' : 'Accuracy']} />
                        <Bar dataKey="score" fill="#06b6d4" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}
        </StepCard>

        <StepCard
          id="predict"
          title="Make Prediction"
          description="Use the trained model to predict the target value for a new row of feature inputs."
          icon={Wand2}
        >
          {!trainingResult?.model_id && !importedModelInfo?.model_id ? (
            <EmptyState>Train or import a model first. Prediction inputs will appear automatically.</EmptyState>
          ) : (
            <>
              {importedModelInfo && (
                <div className="mb-5">
                  <Alert type="success">
                    Imported model ready: {importedModelInfo.model_name} ({importedModelInfo.task_type})
                  </Alert>
                </div>
              )}
              <div className="grid gap-4 md:grid-cols-2">
                {(trainingResult?.feature_columns || importedModelInfo?.feature_columns || []).map((column) => (
                  <label key={column} className="block text-sm font-semibold text-slate-700">
                    {column}
                    <input
                      type="text"
                      className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                      value={predictionInputs[column] ?? ''}
                      onChange={(event) => handlePredictionInputChange(column, event.target.value)}
                    />
                  </label>
                ))}
              </div>
              <div className="mt-5">
                <PrimaryButton icon={Sparkles} onClick={handlePredict} disabled={!predictionReady || predicting}>
                  {predicting ? 'Predicting...' : 'Predict'}
                </PrimaryButton>
              </div>
              <div className="mt-5">
                {predicting && <LoadingState>Predicting outcome...</LoadingState>}
                {predictionError && <ErrorAlert>{predictionError}</ErrorAlert>}
              </div>
              {predictionResult && (
                <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-6">
                  <p className="text-sm font-semibold text-green-700">Predicted value</p>
                  <p className="mt-2 text-4xl font-bold text-slate-950">{predictionResult.prediction}</p>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <MetricCard label="Model used" value={predictionResult.model_name} />
                    {predictionResult.prediction_probability !== null && (
                      <MetricCard label="Prediction probability" value={`${(predictionResult.prediction_probability * 100).toFixed(2)}%`} highlight />
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </StepCard>

        <StepCard
          id="import-model"
          title="Import Model"
          description="Upload a previously exported AI-Playground .joblib model and use it for prediction."
          icon={Upload}
        >
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
            <label className="block text-sm font-semibold text-slate-700">
              Model file
              <input
                type="file"
                accept=".joblib"
                className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-950 file:px-4 file:py-2 file:text-sm file:font-bold file:text-white hover:file:bg-slate-800"
                onChange={handleModelFileChange}
              />
            </label>
            <AccentButton icon={Upload} onClick={handleImportModel} disabled={!modelFile || importingModel}>
              {importingModel ? 'Uploading model...' : 'Upload Model'}
            </AccentButton>
          </div>

          <div className="mt-5 grid gap-3">
            {importingModel && <LoadingState>Uploading model...</LoadingState>}
            {modelImportMessage && <SuccessAlert>{modelImportMessage}</SuccessAlert>}
            {modelImportError && <ErrorAlert>{modelImportError}</ErrorAlert>}
          </div>

          {importedModelInfo && (
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <MetricCard label="Imported model" value={importedModelInfo.model_name} />
              <MetricCard label="Task type" value={importedModelInfo.task_type} />
              <MetricCard label="Model ID" value={importedModelInfo.model_id} />
            </div>
          )}
        </StepCard>

        <StepCard
          id="report"
          title="Download Report"
          description="Export a polished PDF report summarizing the dataset, model, evaluation, comparison, and prediction."
          icon={Download}
        >
          {!trainingResult ? (
            <EmptyState>Train at least one model before generating a PDF report.</EmptyState>
          ) : (
            <>
              <AccentButton icon={FileDown} onClick={handleDownloadReport} disabled={reportLoading}>
                {reportLoading ? 'Generating report...' : 'Download Experiment Report'}
              </AccentButton>
              <div className="mt-5 grid gap-3">
                {reportLoading && <LoadingState>Generating report...</LoadingState>}
                {reportMessage && <SuccessAlert>{reportMessage}</SuccessAlert>}
                {reportError && <ErrorAlert>{reportError}</ErrorAlert>}
              </div>
            </>
          )}
        </StepCard>

        <StepCard
          id="history"
          title="Experiment History"
          description="Review previous training runs saved in your browser. This uses localStorage, so no database is required."
          icon={History}
        >
          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard label="Total experiments saved" value={experimentHistory.length} />
            <MetricCard
              label="Best accuracy achieved"
              value={bestSavedExperiment ? formatAccuracy(bestSavedExperiment.accuracy) : 'Not available'}
              highlight={Boolean(bestSavedExperiment)}
            />
            <MetricCard
              label="Most recent model"
              value={mostRecentExperiment?.selected_model || 'Not available'}
            />
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-600">
              Training a model automatically saves an experiment record here.
            </p>
            <SecondaryButton
              icon={Trash2}
              onClick={clearExperimentHistory}
              disabled={experimentHistory.length === 0}
              className="text-red-700 hover:border-red-200 hover:bg-red-50 hover:text-red-800"
            >
              Clear All History
            </SecondaryButton>
          </div>

          {experimentHistory.length === 0 ? (
            <div className="mt-6">
              <EmptyState>No experiments saved yet. Train a model to save your first experiment.</EmptyState>
            </div>
          ) : (
            <div className="mt-6 grid gap-4">
              {experimentHistory.map((experiment) => (
                <div
                  key={experiment.experiment_id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                >
                  <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-start">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-cyan-800 ring-1 ring-cyan-100">
                          {experiment.experiment_id}
                        </span>
                        <span className="text-sm font-medium text-slate-500">
                          {experiment.date_time}
                        </span>
                      </div>
                      <h3 className="mt-3 text-xl font-bold text-slate-950">
                        {experiment.filename}
                      </h3>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Target</p>
                          <p className="mt-1 font-semibold text-slate-900">
                            {experiment.target_column} ({experiment.task_type || 'classification'})
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Model</p>
                          <p className="mt-1 font-semibold text-slate-900">{experiment.selected_model}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Accuracy</p>
                          <p className="mt-1 font-semibold text-cyan-700">{formatAccuracy(experiment.accuracy)}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Best model</p>
                          <p className="mt-1 font-semibold text-slate-900">
                            {experiment.best_model
                              ? `${experiment.best_model.model_name} (${
                                  experiment.task_type === 'regression'
                                    ? formatScore(experiment.best_model.r2_score)
                                    : formatAccuracy(experiment.best_model.accuracy)
                                })`
                              : 'Not compared'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Rows</p>
                          <p className="mt-1 font-semibold text-slate-900">{experiment.total_rows}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Tuning</p>
                          <p className="mt-1 font-semibold text-slate-900">
                            {experiment.tuning_result
                              ? formatAccuracy(experiment.tuning_result.tuned_accuracy)
                              : 'Not tuned'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 lg:justify-end">
                      <SecondaryButton
                        icon={Eye}
                        onClick={() => toggleExperimentDetails(experiment.experiment_id)}
                      >
                        {expandedExperimentId === experiment.experiment_id ? 'Hide Details' : 'View Details'}
                      </SecondaryButton>
                      <SecondaryButton
                        icon={Trash2}
                        onClick={() => deleteExperiment(experiment.experiment_id)}
                        className="text-red-700 hover:border-red-200 hover:bg-red-50 hover:text-red-800"
                      >
                        Delete
                      </SecondaryButton>
                    </div>
                  </div>

                  {expandedExperimentId === experiment.experiment_id && (
                    <div className="mt-6 grid gap-5 rounded-xl border border-slate-200 bg-white p-5">
                      <div className="grid gap-4 md:grid-cols-3">
                        <MetricCard label="Selected model" value={experiment.selected_model} />
                        <MetricCard label="Training rows" value={experiment.training_rows} />
                        <MetricCard label="Testing rows" value={experiment.testing_rows} />
                      </div>

                      {experiment.evaluation_settings && (
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                          <h4 className="font-bold text-slate-950">Evaluation settings</h4>
                          <div className="mt-4 grid gap-4 md:grid-cols-4">
                            <MetricCard label="Test size" value={`${experiment.evaluation_settings.test_size * 100}%`} />
                            <MetricCard label="Random state" value={experiment.evaluation_settings.random_state} />
                            <MetricCard label="Cross-validation" value={experiment.evaluation_settings.use_cross_validation ? 'Enabled' : 'Disabled'} />
                            <MetricCard label="CV folds" value={experiment.evaluation_settings.cv_folds} />
                          </div>
                        </div>
                      )}

                      {experiment.preprocessing_settings && (
                        <div className="rounded-xl border border-slate-200 bg-white p-5">
                          <h4 className="font-bold text-slate-950">Preprocessing settings</h4>
                          <div className="mt-4 grid gap-4 md:grid-cols-3">
                            <MetricCard label="Remove duplicates" value={experiment.preprocessing_settings.remove_duplicates ? 'On' : 'Off'} />
                            <MetricCard label="Remove constants" value={experiment.preprocessing_settings.remove_constant_columns ? 'On' : 'Off'} />
                            <MetricCard label="Scale numeric" value={experiment.preprocessing_settings.scale_numeric ? 'On' : 'Off'} />
                            <MetricCard label="Numeric missing" value={experiment.preprocessing_settings.numeric_missing_strategy} />
                            <MetricCard label="Categorical missing" value={experiment.preprocessing_settings.categorical_missing_strategy} />
                            <MetricCard label="Encoding" value={experiment.preprocessing_settings.encoding_strategy} />
                          </div>
                        </div>
                      )}

                      {experiment.cv_scores && (
                        <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-5">
                          <h4 className="font-bold text-slate-950">Cross-validation results</h4>
                          <div className="mt-4 grid gap-4 md:grid-cols-3">
                            <MetricCard label="Mean CV score" value={formatCvScore(experiment.cv_mean_score, experiment.task_type)} highlight />
                            <MetricCard label="CV std" value={formatScore(experiment.cv_std_score)} />
                            <MetricCard label="Folds" value={experiment.cv_folds} />
                          </div>
                        </div>
                      )}

                      <div>
                        <h4 className="font-bold text-slate-950">Feature columns</h4>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {experiment.feature_columns.map((column) => (
                            <span
                              key={column}
                              className="rounded-lg bg-slate-50 px-3 py-1 text-sm font-semibold text-slate-700 ring-1 ring-slate-200"
                            >
                              {column}
                            </span>
                          ))}
                        </div>
                      </div>

                      {experiment.comparison_results && (
                        <div className="overflow-hidden rounded-xl border border-slate-200">
                          <div className="bg-slate-50 px-5 py-4">
                            <h4 className="font-bold text-slate-950">Comparison results</h4>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200 text-sm">
                              <thead className="bg-slate-100">
                                <tr>
                                  <th className="px-4 py-3 text-left font-bold text-slate-700">Model</th>
                                  <th className="px-4 py-3 text-left font-bold text-slate-700">
                                    {experiment.task_type === 'regression' ? 'R2 score' : 'Accuracy'}
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 bg-white">
                                {experiment.comparison_results.map((result) => (
                                  <tr key={result.model_name} className="odd:bg-white even:bg-slate-50">
                                    <td className="px-4 py-3 font-semibold text-slate-800">{result.model_name}</td>
                                    <td className="px-4 py-3 text-slate-700">
                                      {experiment.task_type === 'regression'
                                        ? formatScore(result.r2_score)
                                        : formatAccuracy(result.accuracy)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {experiment.recommendation && (
                        <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-5">
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="rounded-full bg-cyan-500 px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-950">
                              Best Choice
                            </span>
                            <h4 className="text-lg font-bold text-slate-950">
                              Recommended Model: {experiment.recommendation.recommended_model}
                            </h4>
                          </div>
                          <div className="mt-4 grid gap-4 lg:grid-cols-3">
                            <div>
                              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Reason</p>
                              <p className="mt-1 text-sm leading-6 text-slate-700">{experiment.recommendation.reason}</p>
                            </div>
                            <div>
                              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Suggestion</p>
                              <p className="mt-1 text-sm leading-6 text-slate-700">{experiment.recommendation.suggestion}</p>
                            </div>
                            <div>
                              <p className="text-xs font-bold uppercase tracking-wide text-amber-700">Caution</p>
                              <p className="mt-1 text-sm leading-6 text-amber-800">{experiment.recommendation.caution}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {experiment.tuning_result && (
                        <div className="rounded-xl border border-cyan-200 bg-white p-5">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-cyan-700">Hyperparameter tuning</p>
                              <h4 className="mt-1 text-xl font-bold text-slate-950">
                                {experiment.tuning_result.model_name}
                              </h4>
                            </div>
                            <p className="text-3xl font-bold text-cyan-700">
                              {formatAccuracy(experiment.tuning_result.tuned_accuracy)}
                            </p>
                          </div>
                          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {Object.entries(experiment.tuning_result.best_parameters).map(([parameter, value]) => (
                              <div key={parameter} className="rounded-xl bg-slate-50 p-4">
                                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{parameter}</p>
                                <p className="mt-1 font-bold text-slate-950">{String(value)}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {experiment.feature_analysis && (
                        <div className="rounded-xl border border-slate-200 bg-white p-5">
                          <h4 className="font-bold text-slate-950">Feature insights</h4>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {experiment.feature_analysis.important_features.slice(0, 5).map((feature) => (
                              <span
                                key={feature.feature_name}
                                className="rounded-lg bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-800 ring-1 ring-cyan-100"
                              >
                                {feature.feature_name}: {formatScore(feature.importance_score)}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {experiment.model_portability && (
                        <div className="rounded-xl border border-slate-200 bg-white p-5">
                          <h4 className="font-bold text-slate-950">Model export/import</h4>
                          <div className="mt-4 grid gap-4 md:grid-cols-3">
                            <MetricCard label="Exported" value={experiment.model_portability.exported ? 'Yes' : 'No'} />
                            <MetricCard label="Imported" value={experiment.model_portability.imported ? 'Yes' : 'No'} />
                            <MetricCard
                              label="Model"
                              value={experiment.model_portability.exported_model_name || experiment.model_portability.imported_model_name || 'Not available'}
                            />
                          </div>
                        </div>
                      )}

                      {experiment.prediction_result && (
                        <div className="rounded-xl border border-green-200 bg-green-50 p-5">
                          <p className="text-sm font-semibold text-green-700">Prediction result</p>
                          <p className="mt-2 text-3xl font-bold text-slate-950">
                            {experiment.prediction_result.prediction}
                          </p>
                          {experiment.prediction_result.prediction_probability !== null && (
                            <p className="mt-2 text-sm font-semibold text-slate-700">
                              Probability: {formatAccuracy(experiment.prediction_result.prediction_probability)}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </StepCard>
      </main>

      <footer className="border-t border-slate-200 bg-white px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-slate-900">AI-Playground {APP_VERSION}</p>
            <p>No-Code ML Experimentation Platform built for students, beginners, and practical ML exploration.</p>
          </div>
          <button
            type="button"
            onClick={() => setShowAboutModal(true)}
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-2 font-bold text-cyan-800 transition hover:bg-cyan-100"
          >
            <Rocket size={16} />
            Deployment Ready
          </button>
        </div>
      </footer>

      {showAboutModal && <AboutModal onClose={() => setShowAboutModal(false)} />}
    </div>
  )
}

export default App
