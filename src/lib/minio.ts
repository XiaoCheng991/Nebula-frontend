import { Client } from 'minio'
import { apiLogger } from './utils/logger'

const minioConfig = {
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || '',
  secretKey: process.env.MINIO_SECRET_KEY || '',
  bucket: process.env.MINIO_BUCKET || 'user-uploads',
  publicUrl: process.env.MINIO_PUBLIC_URL || '',
}

export function validateMinioConfig(): { valid: boolean; error?: string } {
  if (!minioConfig.accessKey) {
    return { valid: false, error: '缺少MINIO_ACCESS_KEY环境变量' }
  }
  if (!minioConfig.secretKey) {
    return { valid: false, error: '缺少MINIO_SECRET_KEY环境变量' }
  }
  if (minioConfig.endPoint === 'localhost') {
    apiLogger.warn('MINIO_ENDPOINT使用默认值localhost，请确认是否正确')
  }
  return { valid: true }
}

let minioClient: Client | null = null
let bucketChecked = false

function getMinioClient(): Client {
  if (!minioClient) {
    apiLogger.debug('初始化MinIO客户端', {
      endPoint: minioConfig.endPoint,
      port: minioConfig.port,
      useSSL: minioConfig.useSSL,
      bucket: minioConfig.bucket,
    })

    minioClient = new Client({
      endPoint: minioConfig.endPoint,
      port: minioConfig.port,
      useSSL: minioConfig.useSSL,
      accessKey: minioConfig.accessKey,
      secretKey: minioConfig.secretKey,
    })
  }
  return minioClient
}

async function ensureBucketExists(): Promise<void> {
  if (bucketChecked) {
    return
  }

  const client = getMinioClient()

  try {
    const exists = await client.bucketExists(minioConfig.bucket)

    if (!exists) {
      apiLogger.info(`创建MinIO桶 "${minioConfig.bucket}"`)
      await client.makeBucket(minioConfig.bucket, 'us-east-1')
      apiLogger.info(`MinIO bucket "${minioConfig.bucket}" 创建成功`)
    } else {
      apiLogger.debug(`MinIO桶 "${minioConfig.bucket}" 已存在`)
    }

    bucketChecked = true
  } catch (error) {
    apiLogger.error('检查/创建MinIO桶时出错', error)
    throw error
  }
}

export async function uploadFile(
  objectName: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  try {
    apiLogger.debug('上传文件到MinIO', { objectName, contentType, size: buffer.length })

    const client = getMinioClient()
    await ensureBucketExists()

    await client.putObject(
      minioConfig.bucket,
      objectName,
      buffer,
      buffer.length,
      { 'Content-Type': contentType }
    )
    apiLogger.debug('文件上传成功', { objectName })

    const protocol = minioConfig.useSSL ? 'https' : 'http'
    const host = minioConfig.publicUrl || `${minioConfig.endPoint}:${minioConfig.port}`
    const publicUrl = `${protocol}://${host}/${minioConfig.bucket}/${objectName}`

    return publicUrl
  } catch (error) {
    apiLogger.error('MinIO上传失败', error)
    throw error
  }
}

export async function deleteFile(objectName: string): Promise<void> {
  const client = getMinioClient()

  try {
    await client.removeObject(minioConfig.bucket, objectName)
  } catch (error) {
    apiLogger.error('Error deleting file from MinIO', error)
    throw error
  }
}

export function extractObjectName(url: string): string | null {
  try {
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split('/').filter(Boolean)

    const bucketIndex = pathParts.indexOf(minioConfig.bucket)
    if (bucketIndex !== -1 && bucketIndex + 1 < pathParts.length) {
      return pathParts.slice(bucketIndex + 1).join('/')
    }

    if (pathParts.length >= 2) {
      return pathParts.slice(1).join('/')
    }

    return null
  } catch (error) {
    apiLogger.error('Error extracting object name', error)
    return null
  }
}

export function isMinioUrl(url: string): boolean {
  if (!url) return false

  try {
    const urlObj = new URL(url)
    const hostname = urlObj.hostname

    const minioHost = minioConfig.publicUrl
      ? new URL(minioConfig.useSSL ? 'https://' : 'http://' + minioConfig.publicUrl).hostname
      : minioConfig.endPoint

    return hostname === minioHost || url.includes(minioConfig.bucket)
  } catch {
    return false
  }
}

export { minioConfig, getMinioClient, ensureBucketExists }