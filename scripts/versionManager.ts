// # 每次运行都会自动升级 patch 版本 (0.7.2 → 0.7.3 → 0.7.4)
// npm run build

// 升级 minor 版本 (0.7.2 → 0.8.0)
// VERSION_BUMP_TYPE=minor npm run build

// 升级 major 版本 (0.7.2 → 1.0.0)
// VERSION_BUMP_TYPE=major npm run build

import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const VERSION_FILE = join(__dirname, '../version.store')
const INITIAL_VERSION = '0.7.2' // 你的初始版本

type VersionBumpType = 'major' | 'minor' | 'patch'

interface VersionData {
  major: number
  minor: number
  patch: number
}

export class VersionManager {
  private currentVersion: VersionData

  constructor() {
    this.currentVersion = this.readVersionFromStore()
  }

  private parseVersion(versionString: string): VersionData {
    const [major, minor, patch] = versionString.split('.').map(Number)
    return { major, minor, patch }
  }

  private readVersionFromStore(): VersionData {
    try {
      const stored = readFileSync(VERSION_FILE, 'utf-8').trim()
      return this.parseVersion(stored)
    } catch (error) {
      // 首次使用时创建初始版本
      writeFileSync(VERSION_FILE, INITIAL_VERSION)
      return this.parseVersion(INITIAL_VERSION)
    }
  }

  public bumpVersion(type: VersionBumpType = 'patch'): string {
    const newVersion = { ...this.currentVersion }

    switch (type) {
      case 'major':
        newVersion.major += 1
        newVersion.minor = 0
        newVersion.patch = 0
        break
      case 'minor':
        newVersion.minor += 1
        newVersion.patch = 0
        break
      case 'patch':
        newVersion.patch += 1
        break
    }

    this.currentVersion = newVersion
    const versionString = `${newVersion.major}.${newVersion.minor}.${newVersion.patch}`
    
    writeFileSync(VERSION_FILE, versionString)
    return versionString
  }

  public generateVersionFile() {
    const versionString = this.getCurrentVersion()
    const publicDir = join(__dirname, '../public')
    
    writeFileSync(
      join(publicDir, 'version.json'),
      JSON.stringify({ version: versionString }, null, 2)
    )
  }

  public getCurrentVersion(): string {
    return `${this.currentVersion.major}.${this.currentVersion.minor}.${this.currentVersion.patch}`
  }
}