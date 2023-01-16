<script>
  import { providers } from "ethers";
  import fileReaderStream from "https://esm.sh/filereader-stream";

  let files = [];
  let progress = 0;
  let link = "";
  let status = "";
  let success = false;

  const upload = async (e) => {
    e.target.disabled = true;
    status = "Starting upload...";
    await window.ethereum.enable();
    const provider = new providers.Web3Provider(window.ethereum);
    await provider._ready();

    const bundlr = new WebBundlr(
      "https://node2.bundlr.network",
      "matic",
      provider
    );

    await bundlr.ready();

    const price = await bundlr.getPrice(files[0].size);
    const balance = await bundlr.getLoadedBalance();

    if (balance.isLessThan(price)) {
      status = "Funding Bundlr...";
      try {
        await bundlr.fund(price.minus(balance).multipliedBy(1.1).toFixed(0));
      } catch (e) {
        status = "Not enough funds for Upload.";
        console.log("Not enough funds for Upload.");
        e.target.disabled = false;
        return;
      }
    }

    const uploader = bundlr.uploader.chunkedUploader;
    const dataStream = fileReaderStream(files[0]);

    uploader.on("chunkUpload", (chunkInfo) => {
      status = "Uploading Chunk...";
      console.log(chunkInfo);
      console.log(
        `Uploaded Chunk number ${chunkInfo.id}, offset of ${chunkInfo.offset}, size ${chunkInfo.size} Bytes, with a total of ${chunkInfo.totalUploaded} bytes uploaded.`
      );
      const percent = ((chunkInfo.totalUploaded / files[0].size) * 100).toFixed(
        0
      );

      console.log(
        `Uploaded: ${chunkInfo.totalUploaded} of ${files[0].size} : Percent = ${percent}`
      );
      progress = percent;
    });
    // event callback: called if an error happens
    uploader.on("chunkError", (e) => {
      status = "Got Error!";
      console.error(
        `Error uploading chunk number ${e.id} - ${e.res.statusText}`
      );
    });
    // event callback: called when file is fully uploaded
    uploader.on("done", (finishRes) => {
      status = "Upload Complete";
      console.log(`Upload completed with ID ${finishRes.id}`);
      // set the progress bar to 100
      //setProgress(100);
      progress = 100;
      console.log("progress: ", progress);
    });
    status = "Uploading File...";
    // upload the file
    await uploader
      .uploadData(dataStream, {
        tags: [{ name: "Content-Type", value: files[0].type }],
      })
      .then((res) => {
        console.log(`Upload Success:`);
        console.log("https://arweave.net/" + res.data.id);
        link = "https://arweave.net/" + res.data.id;
        success = true;
      })
      .catch((e) => {
        console.log("Upload error ", e.message);
        console.log("error on upload, ", e);
      });
  };
</script>

<main class="hero">
  <div class="hero-content flex-col">
    <h1 class="text-6xl center">Mega Uploader</h1>
    <form on:submit|preventDefault={upload} class="space-y-8">
      <div class="form-container">
        <label for="file" class="label">Choose File</label>
        <input id="file" type="file" class="input input-bordered" bind:files />
      </div>
      <div>
        <button class="btn">Upload</button>
      </div>
    </form>
    <div class="">
      <label for="progress">{status}</label>
      <input
        id="progress"
        type="range"
        min="0"
        max="100"
        bind:value={progress}
        class="range"
      />
    </div>
    {#if success}
      <a class="link" href={link}>{link}</a>
    {/if}
    <div class="prose">
      <h2>About this Demo</h2>
      <p>
        This demo uses Metamask and Polygon ($matic) to upload content to the
        Permaweb.
      </p>
      <p>Step 1 - Choose File to Upload</p>
      <p>Step 2 - Click Upload</p>
      <p>Step 3 - Use Metamask to fund Bundlr</p>
      <p>Step 4 - Sign Transaction</p>
    </div>
  </div>
</main>
