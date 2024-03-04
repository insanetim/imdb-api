import apiRequestRawHtml from "./apiRequestRawHtml";
import DomParser from "dom-parser";
import seriesFetcher from "./seriesFetcher";

export default async function getTitle(id) {
  const parser = new DomParser();
  const html = await apiRequestRawHtml(`https://www.imdb.com/title/${id}`);
  const dom = parser.parseFromString(html);
  const nextData = dom.getElementsByAttribute("id", "__NEXT_DATA__");
  const json = JSON.parse(nextData[0].textContent);

  const props = json.props.pageProps;

  const getCredits = (lookFor, v) => {
    const result = props.aboveTheFoldData?.principalCredits?.find(
      (e) => e?.category?.id === lookFor
    );

    return result
      ? result?.credits?.map((e) => {
          if (v === "2")
            return {
              id: e?.name?.id,
              name: e?.name?.nameText?.text,
            };

          return e?.name?.nameText?.text;
        })
      : [];
  };

  return {
    id: id,
    review_api_path: `/reviews/${id}`,
    imdb: `https://www.imdb.com/title/${id}`,
    contentType: props.aboveTheFoldData?.titleType?.id ?? null,
    contentRating: props.aboveTheFoldData?.certificate?.rating ?? null,
    isSeries: props.aboveTheFoldData?.titleType?.isSeries ?? null,
    productionStatus:
      props.aboveTheFoldData?.productionStatus?.currentProductionStage?.id ?? null,
    isReleased:
      props.aboveTheFoldData?.productionStatus?.currentProductionStage?.id ===
      "released",
    title: props.aboveTheFoldData?.titleText?.text ?? null,
    image: props.aboveTheFoldData?.primaryImage?.url ?? null,
    images: props.mainColumnData?.titleMainImages?.edges
      .filter((e) => e?.__typename === "ImageEdge")
      .map((e) => e?.node?.url) ?? null,
    plot: props.aboveTheFoldData?.plot?.plotText?.plainText ?? null,
    runtime:
      props.aboveTheFoldData?.runtime?.displayableProperty?.value?.plainText ??
      "",
    runtimeSeconds: props.aboveTheFoldData?.runtime?.seconds ?? null,
    rating: {
      count: props.aboveTheFoldData.ratingsSummary?.voteCount ?? null,
      star: props.aboveTheFoldData.ratingsSummary?.aggregateRating ?? null,
    },
    award: {
      wins: props.mainColumnData?.wins?.total ?? null,
      nominations: props.mainColumnData?.nominations?.total ?? null,
    },
    genre: props.aboveTheFoldData?.genres?.genres?.map((e) => e?.id),
    releaseDetailed: {
      date: new Date(
        props.aboveTheFoldData?.releaseDate?.year,
        props.aboveTheFoldData?.releaseDate?.month - 1,
        props.aboveTheFoldData?.releaseDate?.day
      ).toISOString() ?? null,
      day: props.aboveTheFoldData?.releaseDate?.day ?? null,
      month: props.aboveTheFoldData?.releaseDate?.month ?? null,
      year: props.aboveTheFoldData?.releaseDate?.year ?? null,
      releaseLocation: {
        country: props.mainColumnData?.releaseDate?.country?.text ?? null,
        cca2: props.mainColumnData?.releaseDate?.country?.id ?? null,
      },
      originLocations: props.mainColumnData?.countriesOfOrigin?.countries?.map(
        (e) => ({
          country: e?.text,
          cca2: e?.id,
        })
      ) ?? null,
    },
    year: props.aboveTheFoldData?.releaseDate?.year ?? null,
    spokenLanguages: props.mainColumnData?.spokenLanguages?.spokenLanguages?.map(
      (e) => ({
        language: e?.text,
        id: e?.id,
      })
    ) ?? null,
    filmingLocations: props.mainColumnData?.filmingLocations?.edges?.map(
      (e) => e?.node?.text
    ) ?? null,
    actors: getCredits("cast"),
    actors_v2: getCredits("cast", "2"),
    creators: getCredits("creator"),
    creators_v2: getCredits("creator", "2"),
    directors: getCredits("director"),
    directors_v2: getCredits("director", "2"),
    writers: getCredits("writer"),
    writers_v2: getCredits("writer", "2"),
    top_credits: props.aboveTheFoldData?.principalCredits?.map((e) => ({
      id: e?.category?.id,
      name: e?.category?.text,
      credits: e?.credits?.map((e) => e?.name?.nameText?.text),
    })) ?? null,
    ...(props.aboveTheFoldData?.titleType?.isSeries
      ? await seriesFetcher(id)
      : {}),
  };
}
