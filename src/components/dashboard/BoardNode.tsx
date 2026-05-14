import { Handle, Position } from '@xyflow/react';

export default function BoardNode({ data }: any) {
    return (
        <div className="group bg-white border border-slate-200/80 rounded-2xl p-4 shadow-md hover:shadow-xl transition-all min-w-[200px]">
            {/* จุดเชื่อมต่อเส้น (Handle) */}
            <Handle type="target" position={Position.Left} className="w-3 h-3 bg-blue-400" />

            <div className="flex items-center gap-3 mb-2">
                <div className={`w-8 h-8 rounded-lg bg-linear-to-br ${data.gradient} flex items-center justify-center text-white font-bold text-sm`}>
                    {data.label.charAt(0).toUpperCase()}
                </div>
                <h3 className="text-sm font-bold text-slate-900 truncate">{data.label}</h3>
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
                <span className="text-[10px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    {data.taskCount || 0} งาน
                </span>
                <button className="text-[10px] text-slate-400 hover:text-blue-600 transition-colors">
                    คลิกเพื่อเปิด →
                </button>
            </div>

            <Handle type="source" position={Position.Right} className="w-3 h-3 bg-blue-400" />
        </div>
    );
}