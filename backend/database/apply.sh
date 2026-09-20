#!/usr/bin/env bash
set -euo pipefail

rait_db_name=${DB_NAME:-detran}
rait_db_host=${DB_HOST:-localhost}
rait_db_port=${DB_PORT:-5432}
rait_db_user=${DB_USER:-postgres}
export PGPASSWORD=${DB_PASSWORD:-}
[[ "$rait_db_name" =~ ^[A-Za-z_][A-Za-z0-9_]*$ ]] || { echo "invalid DB_NAME identifier" >&2; exit 2; }
rait_full=0
for rait_argument in "$@"; do
  case "$rait_argument" in
    --full) rait_full=1 ;;
    *) echo "unknown flag: $rait_argument" >&2; exit 2 ;;
  esac
done
if [[ "$rait_full" = 1 && ( "$rait_db_name" != detran_r7_ctg1_a2 || "${DETRAN_PRIORITY_UPGRADE_FULL_AUTHORIZED:-}" != 1 ) ]]; then
  echo "--full requires explicit disposable detran_r7_ctg1_a2 rehearsal authorization" >&2
  exit 2
fi
rait_directory="$(cd "$(dirname "$0")" && pwd)"
# Closed inventory and lexical SQL inspection precede every connection.
# Dollar bodies, quoted literals and nested comments are lexed separately.
read -r -d '' rait_preflight_source <<'NODE' || true
const fs = require('node:fs');
const path = require('node:path');
const dir = process.argv[1];
const full = process.argv[2] === '1';
const ordinary = ["00-extensions.sql","01-schemas.sql","02-auth.sql","03-audit.sql","04-integration-storage.sql","05-role-catalog.sql","10-postgis-functions.sql","11-auth-functions.sql","12-audit-functions.sql","13-ops-agency.sql","13-ops-field-operations.sql","14-inf-lifecycle-vocabulary.sql","15-ops-parameter.sql","16-ops-snapshots.sql","17-ops-evidence.sql","18-ops-offline-sync.sql","19-est-lifecycle-vocabulary.sql","19-portal-platform.sql","20-rls-policies.sql","30-inf-normative.sql","30-ops-example.sql","31-inf-ait.sql","32-inf-measures.sql","33-inf-alcohol.sql","34-inf-rait-case.sql","35-inf-rait-worklist.sql","36-inf-rait-session.sql","37-inf-speed.sql","38-inf-infraction.sql","39-inf-rait-org.sql","40-ch-clinical-network.sql","41-ch-patients.sql","42-ch-encounters.sql","43-ch-exams.sql","44-ch-reports.sql","45-ch-biometrics.sql","46-ch-scheduling.sql","47-ch-restrictions.sql","48-ch-retention.sql","49-ch-process-blocks.sql","50-ch-telehealth.sql","51-ch-billing.sql","52-ch-clinical-controls.sql","53-ch-inconsistencies.sql","54-ch-operational-controls.sql","55-ch-juntas.sql","56-ch-toxicology.sql","57-inf-collection.sql","58-inf-rait-integration.sql","59-inf-notification.sql","60-portal-complaints.sql","61-portal-identity.sql","62-portal-requests.sql","63-portal-inbox.sql","64-portal-citizen-service.sql","65-portal-projections.sql","70-est-crash.sql","71-dashboard-crashes.sql","72-integration-renaest-mirror.sql","75-boat-renaest-job.sql"];
const manual = ['19-rait-priority-pre.sql','19-rait-priority-enforce.sql','19-rait-priority-verify.sql'];
const expected = [...ordinary,...manual].sort();
const present = fs.readdirSync(path.join(dir,'ddl')).filter(n=>n.endsWith('.sql')).sort();
if (JSON.stringify(present)!==JSON.stringify(expected)) throw new Error('Unknown, missing or duplicate DDL inventory');
for (const name of expected) if (!fs.lstatSync(path.join(dir,'ddl',name)).isFile()) throw new Error('DDL must be a regular file: '+name);
function statements(sql) {
  let out=[], text='', i=0;
  while(i<sql.length) {
    if(sql.startsWith('--',i)) { const j=sql.indexOf('\n',i); i=j<0?sql.length:j; text+=' '; continue; }
    if(sql.startsWith('/*',i)) {
      let depth=1;i+=2;
      while(i<sql.length&&depth) {if(sql.startsWith('/*',i)){depth++;i+=2;}else if(sql.startsWith('*/',i)){depth--;i+=2;}else i++;}
      if(depth)throw new Error('Unclosed SQL comment');text+=' ';continue;
    }
    if(sql[i]==="'"||sql[i]==='"') {
      const q=sql[i]; let piece=q;i++;let closed=false;
      while(i<sql.length){const c=sql[i++];piece+=c;if(c===q){if(sql[i]===q){piece+=sql[i++];}else{closed=true;break;}}}
      if(!closed)throw new Error('Unclosed SQL literal');text+=piece;continue;
    }
    const tag=sql.slice(i).match(/^\$(?:[A-Za-z_][A-Za-z0-9_]*)?\$/);
    if(tag){const end=sql.indexOf(tag[0],i+tag[0].length);if(end<0)throw new Error('Unclosed dollar body');text+=sql.slice(i,end+tag[0].length);i=end+tag[0].length;continue;}
    if(sql[i]==='\\')throw new Error('psql meta commands/includes are forbidden');
    if(sql[i]===';'){if(text.trim())out.push(text.trim());text='';i++;continue;}
    text+=sql[i++];
  }
  if(text.trim())out.push(text.trim());return out;
}
const parsed=new Map();
for(const name of expected){
 const source=fs.readFileSync(path.join(dir,'ddl',name),'utf8');
 const list=statements(source);parsed.set(name,list);
 for(const s of list){
   if(/^(?:BEGIN|START\s+TRANSACTION|COMMIT|END|ROLLBACK|ABORT|VACUUM|CHECKPOINT|DISCARD|COPY|PREPARE\s+TRANSACTION)\b/i.test(s)
     || /^(?:CREATE|DROP)\s+(?:DATABASE|TABLESPACE)\b/i.test(s)
     || /^ALTER\s+SYSTEM\b/i.test(s)
     || /^(?:CREATE|DROP|REINDEX)\s+(?:UNIQUE\s+)?INDEX\s+CONCURRENTLY\b/i.test(s)
     || /^REINDEX\b[\s\S]*\bCONCURRENTLY\b/i.test(s)) throw new Error('Non-transactional or transaction-control statement in '+name);
 }
}
// Compare canonical values before DDL05/14. Never restore/mask a legacy write.
const checks=[];
for(const name of ['05-role-catalog.sql','14-inf-lifecycle-vocabulary.sql']){
 for(const s of parsed.get(name).filter(s=>/^INSERT\s+INTO\b/i.test(s))){
   const m=s.match(/^INSERT\s+INTO\s+([a-z_]+\.[a-z_]+)\s*\(([^)]+)\)\s*VALUES\s+([\s\S]+?)\s+ON\s+CONFLICT\s*\(([^)]+)\)/i);
   if(!m)throw new Error('Unrecognized canonical catalog INSERT in '+name);
   const [,table,columns,values,key]=m;
   if(!/^[a-z_]+$/.test(key.trim()))throw new Error('Unsupported catalog identity');
   const cols=columns.split(',').map(c=>c.trim());
   if(cols.some(c=>!/^[a-z_]+$/.test(c)))throw new Error('Invalid canonical column');
   const comparison=cols.map(c=>"t."+c+"::text IS DISTINCT FROM e."+c+"::text").join(' OR ');
   const query="WITH e("+columns+") AS (VALUES "+values+") SELECT EXISTS(SELECT FROM e LEFT JOIN "+table+" t ON t."+key.trim()+"::text=e."+key.trim()+"::text WHERE t."+key.trim()+" IS NULL OR "+comparison+")";
   checks.push("IF to_regclass('"+table+"') IS NOT NULL THEN EXECUTE 'LOCK TABLE "+table+" IN ACCESS EXCLUSIVE MODE'; EXECUTE "+quote(query)+" INTO divergent; IF divergent THEN RAISE EXCEPTION 'Canonical legacy catalog differs: "+table+"'; END IF; END IF;");
 }
}
if(checks.length!==11)throw new Error('Expected eleven canonical catalog INSERT sources');
function quote(s){return "'"+s.replaceAll("'","''")+"'";}
const validAppRole = "SELECT FROM pg_roles WHERE rolname='role_app_backend' AND NOT rolsuper AND NOT rolbypassrls AND NOT rolcanlogin";
const validAuditorRole = "SELECT FROM pg_roles WHERE rolname='role_auditor_min' AND NOT rolsuper AND NOT rolbypassrls AND NOT rolcanlogin";
const rolePreflight = full
  ? "IF EXISTS(SELECT FROM pg_roles WHERE rolname='role_app_backend') AND NOT EXISTS("+validAppRole+") THEN RAISE EXCEPTION 'Existing operational roles required; global creation not authorized'; END IF; IF EXISTS(SELECT FROM pg_roles WHERE rolname='role_auditor_min') AND NOT EXISTS("+validAuditorRole+") THEN RAISE EXCEPTION 'Existing operational roles required; global creation not authorized'; END IF; "
  : "IF NOT EXISTS("+validAppRole+") OR NOT EXISTS("+validAuditorRole+") THEN RAISE EXCEPTION 'Existing operational roles required; global creation not authorized'; END IF; ";
console.log("SET LOCAL ROLE postgres; SET LOCAL search_path = pg_catalog, public; DO $preflight$ DECLARE r record; divergent boolean; BEGIN "+
rolePreflight+
"FOR r IN SELECT n.nspname,c.relname,c.relowner FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname IN ('auth','tenancy','audit','storage','integration','inf','est','ch','ops') AND c.relkind IN ('r','p') ORDER BY n.nspname,c.relname LOOP IF r.relowner <> 'postgres'::regrole THEN RAISE EXCEPTION 'Unsupported legacy owner %.%',r.nspname,r.relname; END IF; END LOOP; "+
checks.join(' ')+" END $preflight$;");
NODE
rait_preflight="$(node -e "$rait_preflight_source" "$rait_directory" "$rait_full")"
rait_psql=(psql -X -v ON_ERROR_STOP=1 -q -h "$rait_db_host" -p "$rait_db_port" -U "$rait_db_user")
if [[ "$rait_full" = 1 ]]; then
  "${rait_psql[@]}" -d postgres -c "DO \$owner\$ BEGIN IF EXISTS (SELECT FROM pg_database WHERE datname = '$rait_db_name' AND datdba <> 'postgres'::regrole) THEN RAISE EXCEPTION 'Unsupported disposable database owner'; END IF; END \$owner\$;"
  "${rait_psql[@]}" -d postgres -c "drop database if exists \"$rait_db_name\" with (force)"
  "${rait_psql[@]}" -d postgres -c "create database \"$rait_db_name\" OWNER postgres"
fi
rait_arguments=(-d "$rait_db_name" --single-transaction -c 'SELECT pg_advisory_xact_lock(7007, 1)' -c "$rait_preflight" -c 'SET LOCAL search_path = public, pg_catalog')
while IFS= read -r rait_path; do
  rait_name="$(basename "$rait_path")"
  case "$rait_name" in
    19-rait-priority-pre.sql|19-rait-priority-enforce.sql|19-rait-priority-verify.sql|20-rls-policies.sql) continue ;;
    34-inf-rait-case.sql) rait_arguments+=(-f "$rait_directory/ddl/19-rait-priority-pre.sql") ;;
  esac
  rait_arguments+=(-f "$rait_path")
done < <(find "$rait_directory/ddl" -maxdepth 1 -type f -name '*.sql' | LC_ALL=C sort)
rait_arguments+=(-f "$rait_directory/ddl/20-rls-policies.sql"
  -f "$rait_directory/ddl/19-rait-priority-enforce.sql"
  -f "$rait_directory/ddl/19-rait-priority-verify.sql")
"${rait_psql[@]}" "${rait_arguments[@]}"
# psql commits successfully before this line is reached.
echo "apply.sh: done (full=$rait_full db=$rait_db_name)"
