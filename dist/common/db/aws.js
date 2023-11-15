var A=Object.create;var g=Object.defineProperty;var R=Object.getOwnPropertyDescriptor;var k=Object.getOwnPropertyNames;var $=Object.getPrototypeOf,x=Object.prototype.hasOwnProperty;var D=(e,t)=>()=>(t||e((t={exports:{}}).exports,t),t.exports),j=(e,t)=>{for(var n in t)g(e,n,{get:t[n],enumerable:!0})},T=(e,t,n,o)=>{if(t&&typeof t=="object"||typeof t=="function")for(let r of k(t))!x.call(e,r)&&r!==n&&g(e,r,{get:()=>t[r],enumerable:!(o=R(t,r))||o.enumerable});return e};var b=(e,t,n)=>(n=e!=null?A($(e)):{},T(t||!e||!e.__esModule?g(n,"default",{value:e,enumerable:!0}):n,e)),C=e=>T(g({},"__esModule",{value:!0}),e);var p=(e,t,n)=>new Promise((o,r)=>{var s=l=>{try{i(n.next(l))}catch(E){r(E)}},a=l=>{try{i(n.throw(l))}catch(E){r(E)}},i=l=>l.done?o(l.value):Promise.resolve(l.value).then(s,a);i((n=n.apply(e,t)).next())});var N=D((oe,L)=>{L.exports={name:"dotenv",version:"16.3.1",description:"Loads environment variables from .env file",main:"lib/main.js",types:"lib/main.d.ts",exports:{".":{types:"./lib/main.d.ts",require:"./lib/main.js",default:"./lib/main.js"},"./config":"./config.js","./config.js":"./config.js","./lib/env-options":"./lib/env-options.js","./lib/env-options.js":"./lib/env-options.js","./lib/cli-options":"./lib/cli-options.js","./lib/cli-options.js":"./lib/cli-options.js","./package.json":"./package.json"},scripts:{"dts-check":"tsc --project tests/types/tsconfig.json",lint:"standard","lint-readme":"standard-markdown",pretest:"npm run lint && npm run dts-check",test:"tap tests/*.js --100 -Rspec",prerelease:"npm test",release:"standard-version"},repository:{type:"git",url:"git://github.com/motdotla/dotenv.git"},funding:"https://github.com/motdotla/dotenv?sponsor=1",keywords:["dotenv","env",".env","environment","variables","config","settings"],readmeFilename:"README.md",license:"BSD-2-Clause",devDependencies:{"@definitelytyped/dtslint":"^0.0.133","@types/node":"^18.11.3",decache:"^4.6.1",sinon:"^14.0.1",standard:"^17.0.0","standard-markdown":"^7.1.0","standard-version":"^9.5.0",tap:"^16.3.0",tar:"^6.1.11",typescript:"^4.8.4"},engines:{node:">=12"},browser:{fs:!1}}});var K=D((ae,u)=>{var S=require("fs"),_=require("path"),Y=require("os"),U=require("crypto"),W=N(),w=W.version,q=/(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg;function P(e){let t={},n=e.toString();n=n.replace(/\r\n?/mg,`
`);let o;for(;(o=q.exec(n))!=null;){let r=o[1],s=o[2]||"";s=s.trim();let a=s[0];s=s.replace(/^(['"`])([\s\S]*)\1$/mg,"$2"),a==='"'&&(s=s.replace(/\\n/g,`
`),s=s.replace(/\\r/g,"\r")),t[r]=s}return t}function B(e){let t=V(e),n=c.configDotenv({path:t});if(!n.parsed)throw new Error(`MISSING_DATA: Cannot parse ${t} for an unknown reason`);let o=I(e).split(","),r=o.length,s;for(let a=0;a<r;a++)try{let i=o[a].trim(),l=Q(n,i);s=c.decrypt(l.ciphertext,l.key);break}catch(i){if(a+1>=r)throw i}return c.parse(s)}function F(e){console.log(`[dotenv@${w}][INFO] ${e}`)}function M(e){console.log(`[dotenv@${w}][WARN] ${e}`)}function y(e){console.log(`[dotenv@${w}][DEBUG] ${e}`)}function I(e){return e&&e.DOTENV_KEY&&e.DOTENV_KEY.length>0?e.DOTENV_KEY:process.env.DOTENV_KEY&&process.env.DOTENV_KEY.length>0?process.env.DOTENV_KEY:""}function Q(e,t){let n;try{n=new URL(t)}catch(i){throw i.code==="ERR_INVALID_URL"?new Error("INVALID_DOTENV_KEY: Wrong format. Must be in valid uri format like dotenv://:key_1234@dotenv.org/vault/.env.vault?environment=development"):i}let o=n.password;if(!o)throw new Error("INVALID_DOTENV_KEY: Missing key part");let r=n.searchParams.get("environment");if(!r)throw new Error("INVALID_DOTENV_KEY: Missing environment part");let s=`DOTENV_VAULT_${r.toUpperCase()}`,a=e.parsed[s];if(!a)throw new Error(`NOT_FOUND_DOTENV_ENVIRONMENT: Cannot locate environment ${s} in your .env.vault file.`);return{ciphertext:a,key:o}}function V(e){let t=_.resolve(process.cwd(),".env");return e&&e.path&&e.path.length>0&&(t=e.path),t.endsWith(".vault")?t:`${t}.vault`}function J(e){return e[0]==="~"?_.join(Y.homedir(),e.slice(1)):e}function H(e){F("Loading env from encrypted .env.vault");let t=c._parseVault(e),n=process.env;return e&&e.processEnv!=null&&(n=e.processEnv),c.populate(n,t,e),{parsed:t}}function G(e){let t=_.resolve(process.cwd(),".env"),n="utf8",o=!!(e&&e.debug);e&&(e.path!=null&&(t=J(e.path)),e.encoding!=null&&(n=e.encoding));try{let r=c.parse(S.readFileSync(t,{encoding:n})),s=process.env;return e&&e.processEnv!=null&&(s=e.processEnv),c.populate(s,r,e),{parsed:r}}catch(r){return o&&y(`Failed to load ${t} ${r.message}`),{error:r}}}function X(e){let t=V(e);return I(e).length===0?c.configDotenv(e):S.existsSync(t)?c._configVault(e):(M(`You set DOTENV_KEY but you are missing a .env.vault file at ${t}. Did you forget to build it?`),c.configDotenv(e))}function z(e,t){let n=Buffer.from(t.slice(-64),"hex"),o=Buffer.from(e,"base64"),r=o.slice(0,12),s=o.slice(-16);o=o.slice(12,-16);try{let a=U.createDecipheriv("aes-256-gcm",n,r);return a.setAuthTag(s),`${a.update(o)}${a.final()}`}catch(a){let i=a instanceof RangeError,l=a.message==="Invalid key length",E=a.message==="Unsupported state or unable to authenticate data";if(i||l){let h="INVALID_DOTENV_KEY: It must be 64 characters long (or more)";throw new Error(h)}else if(E){let h="DECRYPTION_FAILED: Please check your DOTENV_KEY";throw new Error(h)}else throw console.error("Error: ",a.code),console.error("Error: ",a.message),a}}function Z(e,t,n={}){let o=!!(n&&n.debug),r=!!(n&&n.override);if(typeof t!="object")throw new Error("OBJECT_REQUIRED: Please check the processEnv argument being passed to populate");for(let s of Object.keys(t))Object.prototype.hasOwnProperty.call(e,s)?(r===!0&&(e[s]=t[s]),o&&y(r===!0?`"${s}" is already defined and WAS overwritten`:`"${s}" is already defined and was NOT overwritten`)):e[s]=t[s]}var c={configDotenv:G,_configVault:H,_parseVault:B,config:X,decrypt:z,parse:P,populate:Z};u.exports.configDotenv=c.configDotenv;u.exports._configVault=c._configVault;u.exports._parseVault=c._parseVault;u.exports.config=c.config;u.exports.decrypt=c.decrypt;u.exports.parse=c.parse;u.exports.populate=c.populate;u.exports=c});var re={};j(re,{Dynamo:()=>ne,documentClient:()=>d,ses:()=>te,sqs:()=>ee});module.exports=C(re);var O=b(K());O.config();var v=process.env.ACCESS_ID_TOKEN,m=process.env.SECRET_TOKEN,ce=process.env.JWT_SECRET,ie=process.env.EXPIRES_IN,le=process.env.SQS_URL,ue=process.env.REFRESH_TOKEN_SECRET;var f=b(require("aws-sdk"));var ee=new f.SQS({apiVersion:"2012-11-05",region:"us-west-1",credentials:{accessKeyId:v,secretAccessKey:m}}),te=new f.SES({apiVersion:"2010-12-01",region:"us-west-1",credentials:{accessKeyId:v,secretAccessKey:m},endpoint:"http://localhost:4566/"}),d=new f.DynamoDB.DocumentClient({region:"localhost",credentials:{accessKeyId:v,secretAccessKey:m},endpoint:"http://localhost:8000/"}),ne={scan(e){return p(this,null,function*(){let t={TableName:e},n=yield d.scan(t).promise();if(!n||!n.Items)throw Error(`There was an error scanning the table ${e}`);return n.Items})},query(e,t,n){return p(this,null,function*(){let o={TableName:n,KeyConditionExpression:"#k = :v",ExpressionAttributeNames:{"#k":e},ExpressionAttributeValues:{":v":t}},r=yield d.query(o).promise();if(!r||!r.Items)throw Error(`There was an error querying the table ${n}`);return r.Items})},update(e,t,n,o,r){return p(this,null,function*(){let s={TableName:r,Key:{[e]:t},ExpressionAttributeNames:{"#k":n},ExpressionAttributeValues:{":v":o},UpdateExpression:"SET #k = :v",ReturnValues:"ALL_NEW"},a=yield d.update(s).promise();if(!a)throw Error(`There was an error updating the item in table ${r}`);return a.Attributes})},get(e,t,n){return p(this,null,function*(){let o={TableName:n,Key:{[e]:t}},r=yield d.get(o).promise();return console.log(r,"data"),r.Item?r.Item:{result:"No item found"}})},delete(e,t,n){return p(this,null,function*(){let o={TableName:n,Key:{[e]:t}};if(!(yield d.delete(o).promise()))throw Error(`There was an error deleting ${t} from ${n}`);return{result:"Successfully deleted"}})},write(e,t){return p(this,null,function*(){let n={TableName:t,Item:e};return console.log({data:e},"params"),yield d.put(n).promise(),e})}};0&&(module.exports={Dynamo,documentClient,ses,sqs});
//# sourceMappingURL=aws.js.map