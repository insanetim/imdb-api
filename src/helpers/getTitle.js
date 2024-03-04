import apiRequestRawHtml from './apiRequestRawHtml'
import DomParser from 'dom-parser'

export default async function getTitle(id) {
  const parser = new DomParser()
  const html = await apiRequestRawHtml(`https://www.imdb.com/title/${id}`)
  const dom = parser.parseFromString(html)
  const nextData = dom.getElementsByAttribute('id', '__NEXT_DATA__')
  const json = JSON.parse(nextData[0].textContent)

  const props = json.props.pageProps

  return {
    id: id,
    contentRating: props?.aboveTheFoldData?.certificate?.rating ?? null,
    rating: {
      count: props?.aboveTheFoldData?.ratingsSummary?.voteCount ?? null,
      star: props?.aboveTheFoldData?.ratingsSummary?.aggregateRating ?? null,
    },
  }
}
