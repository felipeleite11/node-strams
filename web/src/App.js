import { useEffect, useState } from "react"
import axios from "axios"

import { Progress } from './components/Progress'

function App() {
	const [fileProgress, setFileProgress] = useState(0)
	const [JSONProgress, setJSONProgress] = useState(0)
	const [JSONResult, setJSONResult] = useState([])
	const [result, setResult] = useState('')

	async function fetchJSONData() {
		try {
			setJSONProgress(0)
			setJSONResult([])

			const response = await fetch('http://localhost:3333/objects')

			const totalLength = +response.headers.get('Length-Items')

			const reader = response.body.getReader()

        	const decoder = new TextDecoder('utf-8')

			setJSONResult([])

			let cont = 0

			while (true) {
				const { done, value } = await reader.read()

				if (done) break

				const chunk = decoder.decode(value)

				setJSONResult(old => {
					setJSONProgress(totalLength ? ((cont + 1) * 100) / totalLength : 0)

					cont++

					return [
						...old,
						...JSON.parse(chunk)
					]
				})
			}
		} catch (error) {
			console.error('Erro no download:', error)
		}
	}

	async function fetchTextData() {
		try {
			setResult('')

			const response = await fetch('http://localhost:3333/text')

			const reader = response.body.getReader()

        	const decoder = new TextDecoder('utf-8')

			while (true) {
				const { done, value } = await reader.read()

				if (done) break

				const chunk = decoder.decode(value)
				
				setResult(prevText => prevText + chunk)
			}

			console.log('Recebimento do stream de TEXTO finalizado.')
		} catch (error) {
			console.error('Erro no download:', error)
		}
	}

	async function fetchFileData() {
		try {
			const response = await axios.get('http://localhost:3333/file', {
				responseType: 'blob',
				onDownloadProgress: (progressEvent) => {
					if (progressEvent.total) {
						const percentCompleted = Math.round(
							(progressEvent.loaded * 100) / progressEvent.total
						)

						setFileProgress(percentCompleted)
					}
				}
			})

			const url = URL.createObjectURL(response.data)
    
			const link = document.createElement('a')
			
			link.href = url
			link.target = '_blank'
			link.style.display = 'none'
			link.setAttribute('download', 'big.file')

			document.body.appendChild(link)

			link.click()

			document.body.removeChild(link)

			setFileProgress(0)
		} catch(e) {
			console.error('Erro no download:', e)
		}
	}

	useEffect(() => {
		// fetchJSONData()

		// fetchTextData()

		// fetchFileData()
	}, [])

	return (
		<div className="flex flex-col gap-4">
			<h1 className="text-lg font-bold">Stream de arquivo</h1>

			{fileProgress === 0 && (
				<button onClick={fetchFileData} className="bg-white text-slate-800 p-2 rounded-md w-fit text-sm">
					Baixar arquivo com stream
				</button>
			)}

			{fileProgress > 0 && fileProgress < 100 && (
				<div className="flex flex-col gap-2 w-96">
					<span className="text-center text-sm">Baixando</span>

					<div className="w-full">
						<Progress progress={fileProgress} />
					</div>
				</div>
			)}

			{fileProgress === 100 && (
				<div>Download concluído!</div>
			)}


			<h1 className="text-lg font-bold">Stream de texto</h1>

			<button onClick={fetchTextData} className="bg-white text-slate-800 p-2 rounded-md w-fit text-sm">
				Obter texto com stream
			</button>

			{result && (
				<div 
					dangerouslySetInnerHTML={{ __html: JSON.stringify(result) }} 
					className="bg-yellow-500 p-4 rounded-md text-slate-800 animate__animated animate__fadeIn overflow-y-auto"
				/>
			)}


			<h1 className="text-lg font-bold">Stream de JSON</h1>

			<button onClick={fetchJSONData} className="bg-white text-slate-800 p-2 rounded-md w-fit text-sm">
				Baixar JSON com stream
			</button>

			{JSONProgress > 0 && JSONProgress < 100 && (
				<div className="w-96">
					<Progress progress={JSONProgress} />
				</div>
			)}

			{JSONResult.length > 0 && (
				<>
					<div className="bg-yellow-500 p-4 rounded-md text-slate-800 animate__animated animate__fadeIn overflow-y-auto">
						{JSON.stringify(JSONResult)}
					</div>
				
					<table className="max-w-[40rem]">
						<thead>
							<tr className="border-2">
								<th>ID</th>
								<th>Name</th>
							</tr>
						</thead>
						<tbody>
							{JSONResult.map(item => (
								<tr key={item.id} className="border">
									<td className="text-center">{item.id}</td>
									<td className="text-center">{item.name}</td>
								</tr>
							))}
						</tbody>
					</table>
				</>
			)}
		</div>
	);
}

export default App;
