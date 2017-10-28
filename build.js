const fs = require('fs'), path = require('path'), { execSync } = require('child_process')

const isDirectory = source => fs.lstatSync(source).isDirectory()
const getDirectories = source => fs.readdirSync(source).map(name => path.join(source, name)).filter(isDirectory)

const makeObjLocation = '~/Downloads/Makeobj.exe'
const addonsDirectoryName = '~/Documents/Simutrans/addons/pak128'

const buildDirectoryName = path.join(__dirname, '_build')

if (fs.existsSync(buildDirectoryName)) {
    execSync(`rm -rf ${buildDirectoryName}`)
}

fs.mkdirSync(buildDirectoryName)

getDirectories(__dirname).filter(name => !name.includes('_')).forEach(dir => {
    const pakName = `pak128cz-${path.basename(dir)}.pak`
    const pakPaths = fs.readdirSync(dir).filter(item => item.endsWith('.dat')).map(dat => {
        const datPakName = `pak128cz-intermidiate-${path.basename(dir)}-${dat}.pak`
        execSync(`wine ${makeObjLocation} QUIET pak128 ${path.join(buildDirectoryName, datPakName)} ${path.join(dir, dat)}`)
        return path.join(buildDirectoryName, datPakName)
    })
    execSync(`wine ${makeObjLocation} QUIET MERGE ${path.join(buildDirectoryName, pakName)} ${pakPaths.join(' ')}`)
    pakPaths.forEach(pak => {
        fs.unlinkSync(pak)
    })
})

execSync(`mv ${buildDirectoryName}/*.pak ${addonsDirectoryName}`)

fs.rmdirSync(buildDirectoryName)