export function Progress({ progress }) {
	return (
		<div className="flex flex-col items-center">
			<div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden mx-2">
				<div
					style={{ width: `${progress}%` }}
					className="bg-blue-500 h-full transition-all duration-500 ease-in-out"
				/>
			</div>

			<span className="text-xs">{progress}%</span>
		</div>
	)
}