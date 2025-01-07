# Firestore emulator default project ID

The [firestore-projectId.mjs](firestore-projectId.mjs) script in this repo attempts to connect to the local Firestore emulator (run separately with `firebase emulators only:firestore`). Without passing any specific options to `initializeApp()` or `getFirestore()`, it's unclear which project and which database are selected. The Firebase emulator GUI at http://127.0.0.1:4000/ shows the project name from `.firebaserc` (`"ondocumentcreated-bug"`), but the Firestore tab does *not* show any of the documents written from the script.

Running `firestore-projectId.mjs` with Deno shows that:
* `.firebaserc` is NOT read
* all these 4 env vars are not present: `FIREBASE_CONFIG`, `GOOGLE_APPLICATION_CREDENTIALS`, `GOOGLE_CLOUD_PROJECT`, `GCLOUD_PROJECT`
* documents are created and retrieved successfully, just not from the Firestore database of the "ondocumentcreated-bug" project, even when offline


# Privilege escalation

Running [priv-esc](priv-esc.mjs) with Deno reveals that it attempts to, first, read all environment variables (see the line `⚠️  Deno requests env access.`). This happens when the following line is executed:

```ts
const resultsSnapshot = await resultsRef.get();
```


```text
$ deno priv-esc.mjs 
✅ Granted env access to "GRPC_NODE_VERBOSITY".
✅ Granted env access to "GRPC_VERBOSITY".
✅ Granted env access to "GRPC_NODE_TRACE".
✅ Granted env access to "GRPC_TRACE".
✅ Granted env access to "GRPC_SSL_CIPHER_SUITES".
✅ Granted env access to "GRPC_DEFAULT_SSL_ROOTS_FILE_PATH".
✅ Granted env access to "GRPC_NODE_USE_ALTERNATIVE_RESOLVER".
✅ Granted env access to "GRPC_EXPERIMENTAL_ENABLE_OUTLIER_DETECTION".
✅ Granted env access to "READABLE_STREAM".
✅ Granted env access to "DEBUG".
✅ Granted env access to "FIRESTORE_EMULATOR_HOST".
Calling initializeApp()...
✅ Granted env access to "FIREBASE_CONFIG".
Calling getFirestore()...
✅ Granted env access to "GOOGLE_CLOUD_PROJECT".
✅ Granted env access to "GCLOUD_PROJECT".
✅ Granted env access to "FIRESTORE_PREFER_REST".
✅ Granted env access to "FIRESTORE_ENABLE_TRACING".
Creating ref getFirestore()...
Full env access, attempt to call /bin/sh...
✅ Granted env access to "GOOGLE_CLOUD_UNIVERSE_DOMAIN".
✅ Granted env access to "gcloud_project".
✅ Granted env access to "google_cloud_project".
✅ Granted env access to "GOOGLE_APPLICATION_CREDENTIALS".
✅ Granted env access to "google_application_credentials".
┏ ⚠️  Deno requests env access.
┠─ To see a stack trace for this prompt, set the DENO_TRACE_PERMISSIONS environmental variable.
┠─ Learn more at: https://docs.deno.com/go/--allow-env
┠─ Run again with --allow-env to bypass this prompt.
┗ Allow? [y/n/A] (y = yes, allow; n = no, deny; A = allow all env permissions) > 
```

Then, Firestore apparently tries to launch `/bin/sh` (`⚠️  Deno requests run access to "/bin/sh"`):

```text
[...]

Creating ref getFirestore()...
Full env access, attempt to call /bin/sh...
✅ Granted env access to "GOOGLE_CLOUD_UNIVERSE_DOMAIN".
✅ Granted env access to "gcloud_project".
✅ Granted env access to "google_cloud_project".
✅ Granted env access to "GOOGLE_APPLICATION_CREDENTIALS".
✅ Granted env access to "google_application_credentials".
✅ Granted env access.
✅ Granted read access to <exec_path>.
┏ ⚠️  Deno requests run access to "/bin/sh".
┠─ Requested by `Deno.Command().spawn()` API.
┠─ To see a stack trace for this prompt, set the DENO_TRACE_PERMISSIONS environmental variable.
┠─ Learn more at: https://docs.deno.com/go/--allow-run
┠─ Run again with --allow-run to bypass this prompt.
┗ Allow? [y/n/A] (y = yes, allow; n = no, deny; A = allow all run permissions) > 
```

After granting access, the code continues to ask for seemingly irrelevant information:

```text
✅ Granted read access to "/home/dandv/.config/gcloud/application_default_credentials.json".  <-- doesn't exist
✅ Granted read access to "/sys/class/dmi/id/bios_date".  <-- side effect of some call?
✅ Granted read access to "/sys/class/dmi/id/bios_vendor".  <-- "American Megatrends International, LLC."
✅ Granted sys access to "networkInterfaces".
✅ Granted net access to "169.254.169.254:80".
✅ Granted net access to "metadata.google.internal:80".  <-- interesting private TLD
┏ ⚠️  Deno requests net access to "127.0.0.1:8080"  <-- finally a relevant request
```
