"use server"

import { loadPasswordsFn } from "../../functions/loadPasswordsFn"

export async function loadPasswordsAction() {
  return loadPasswordsFn()
}
