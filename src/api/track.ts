import { post } from "helper/ajax";

export function graphqlTrack(dto: any) {
  return post('/graphql/track', dto, { isNotToken: true, isGraphql: true })
}

export function graphqlTargetTrack(dto: any) {
  return post('/graphql/targetTrack', dto, { isNotToken: true, isGraphql: true })
}