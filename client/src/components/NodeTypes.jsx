import useStore from "../store";
import {
  RocketLaunchIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
} from "@heroicons/react/24/solid";

const NodeHeader = ({ icon: Icon, title, color }) => (
  <div className={`flex items-center p-2 ${color} rounded-t-lg`}>
    <Icon className="w-5 h-5 text-white mr-2" />
    <h3 className="text-white font-semibold">{title}</h3>
  </div>
);

export const nodeTypes = {
  decisionNode: ({ data, id, selected }) => {
    const updateNode = useStore((state) => state.updateNode);

    return (
      <div
        className={`node-container ${selected ? "ring-2 ring-blue-500" : ""}`}
      >
        <NodeHeader
          icon={RocketLaunchIcon}
          title="Decision"
          color="bg-blue-500"
        />

        <div className="p-3 space-y-2">
          <input
            value={data.label}
            onChange={(e) => updateNode(id, { label: e.target.value })}
            placeholder="Decision title..."
            className="node-input"
          />
          <textarea
            value={data.description}
            onChange={(e) => updateNode(id, { description: e.target.value })}
            placeholder="Description..."
            className="node-textarea"
          />
          <div className="flex gap-2">
            <input
              type="number"
              value={data.budget}
              onChange={(e) => updateNode(id, { budget: e.target.value })}
              placeholder="Budget"
              className="node-input-small"
            />
            <input
              type="number"
              value={data.teamSize}
              onChange={(e) => updateNode(id, { teamSize: e.target.value })}
              placeholder="Team size"
              className="node-input-small"
            />
          </div>
        </div>
      </div>
    );
  },
  marketNode: ({ data, id, selected }) => {
    const updateNode = useStore((state) => state.updateNode);

    return (
      <div
        className={`node-container ${selected ? "ring-2 ring-green-500" : ""}`}
      >
        <NodeHeader icon={ChartBarIcon} title="Market" color="bg-green-500" />

        <div className="p-3 space-y-2">
          <input
            value={data.label}
            onChange={(e) => updateNode(id, { label: e.target.value })}
            placeholder="Market condition..."
            className="node-input"
          />
          <select
            value={data.trend}
            onChange={(e) => updateNode(id, { trend: e.target.value })}
            className="node-select"
          >
            <option value="up">📈 Upward Trend</option>
            <option value="down">📉 Downward Trend</option>
            <option value="stable">⚖️ Stable</option>
          </select>
        </div>
      </div>
    );
  },
  riskNode: ({ data, id, selected }) => {
    const updateNode = useStore((state) => state.updateNode);

    return (
      <div
        className={`node-container ${selected ? "ring-2 ring-red-500" : ""}`}
      >
        <NodeHeader
          icon={ExclamationTriangleIcon}
          title="Risk"
          color="bg-red-500"
        />

        <div className="p-3 space-y-2">
          <input
            value={data.label}
            onChange={(e) => updateNode(id, { label: e.target.value })}
            placeholder="Risk title..."
            className="node-input"
          />
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="100"
              value={data.probability}
              onChange={(e) => updateNode(id, { probability: e.target.value })}
              className="w-full"
            />
            <span className="text-sm">{data.probability}%</span>
          </div>
        </div>
      </div>
    );
  },
  outcomeNode: ({ data, selected }) => (
    <div
      className={`node-container ${selected ? "ring-2 ring-purple-500" : ""}`}
    >
      <NodeHeader icon={SparklesIcon} title="Outcome" color="bg-purple-500" />

      <div className="p-3 space-y-2">
        <div className="text-center">
          <p className="font-medium">{data.label}</p>
          <p className="text-sm text-gray-600">{data.description}</p>
        </div>
        <div className={impact-badge ${data.impact}}>
          {data.impact?.toUpperCase()}
        </div>
      </div>
    </div>
  ),
};
export default nodeTypes;