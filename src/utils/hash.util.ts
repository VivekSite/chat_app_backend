import crypto from 'node:crypto'

export const generateMD5Hash = (inputString: string) => {
  const md5Hash = crypto.createHash('md5').update(inputString).digest('hex')
  return md5Hash
}
