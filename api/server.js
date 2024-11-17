import http from 'http'
import { createReadStream, statSync } from 'fs'

const PORT = 3333

const text = 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quia, eum? Fugit, ducimus aliquam. Cupiditate temporibus beatae pariatur a nihil amet velit doloribus voluptatum quaerat reiciendis, fuga minima enim necessitatibus laborum? Lorem ipsum dolor sit amet consectetur adipisicing elit. Aspernatur, minima vitae. Ratione impedit fugit provident enim reprehenderit accusantium adipisci! Eum, suscipit? Reiciendis quae animi inventore cum maiores tempora quod accusantium! Lorem ipsum dolor sit amet consectetur adipisicing elit.'

http.createServer((req, res) => {
	const { url } = req

	if (url === '/text') {
		const chunkSize = 10
		const totalChunks = Math.ceil(text.length / chunkSize)
		const totalSize = totalChunks * chunkSize

		res.writeHead(200, {
			'Content-Length': totalSize,
			// 'Content-Type': 'application/json',
			// 'Content-Type': 'application/octet-stream',
			'Content-Type': 'text/plain',
			'Access-Control-Allow-Origin': '*'
		})

		let sentChunks = 0

		function sendChunk() {
			if (sentChunks < totalChunks) {
				// Enviando pedaços de um texto
				const chunk = text.substring(chunkSize * sentChunks, (chunkSize * sentChunks) + chunkSize)

				res.write(chunk)

				sentChunks++

				setTimeout(sendChunk, 80)
			} else {
				res.end()
			}
		}

		sendChunk()
	}

	if (url === '/objects') {
		const totalChunks = 10

		res.writeHead(200, {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Expose-Headers': 'Length-Items',
			'Length-Items': totalChunks.toString()
		})

		let sentChunks = 0

		let cont = 1

		function sendChunk() {
			if (sentChunks < totalChunks) {
				const chunk = JSON.stringify([
					{
						id: cont,
						name: 'Felipe'
					}
				])

				cont++

				res.write(chunk)

				sentChunks++

				setTimeout(sendChunk, 400)
			} else {
				res.end()
			}
		}

		sendChunk()
	}

	if (url === '/file') {
		const stat = statSync('big.file')

		res.writeHead(200, {
			'Content-Type': 'application/octet-stream',
			'Content-Length': stat.size,
			'Content-Disposition': 'attachment; filename="big.file"',
			'Access-Control-Allow-Origin': '*'
		})

		const readable = createReadStream('big.file', { highWaterMark: 20 * 1024 * 1024 })

		let isProcessing = false

		readable.on('readable', function () {
			if (isProcessing) return

			function processNextChunk() {
				const chunk = readable.read()

				if (chunk) {
					isProcessing = true

					res.write(chunk)

					setTimeout(() => {
						isProcessing = false

						processNextChunk()
					}, 500)
				} else {
					res.end()
				}
			}

			processNextChunk()
		})
	}
}).listen(PORT, () => {
	console.log(`Servidor rodando na porta ${PORT}`)
})
