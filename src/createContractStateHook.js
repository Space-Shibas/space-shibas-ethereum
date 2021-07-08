import useSWR from 'swr'


export function createContractStateHook(contract, globalSwrOptions = {}) {
  if (!contract) {
    function useInitialOnly(_, initialData) {
      return [initialData]
    }
    return useInitialOnly
  }
  function useContractState(stateVarNameOrObject, initialData, transformData, transformInitial, swrOptions = {}) {
    let stateVarName = stateVarNameOrObject
    if (typeof stateVarNameOrObject !== 'string') {
      stateVarName = stateVarNameOrObject.stateVarName
      initialData = stateVarNameOrObject.initialData
      transformData = stateVarNameOrObject.transformData
      transformInitial = stateVarNameOrObject.transformInitial
      swrOptions = stateVarNameOrObject.swrOptions || {}
    }
    if (typeof contract[stateVarName] !== 'function') {
      throw Error(`${contract.name}.${stateVarName} is not callable.`)
    }
    useContractState.initialLoad = true
    useContractState.previousValue = undefined
    async function contractStateFetcher(_, stateVarName) {
      const toReturn = await contract[stateVarName]()
      return toReturn
    }
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { data, error, isValidating, mutate } = useSWR(
      [contract.address, stateVarName],
      contractStateFetcher,
      Object.entries(swrOptions).length ? { ...globalSwrOptions, ...swrOptions } : globalSwrOptions
    )

    let dataToReturn = data
    if (data === undefined) {
      if (useContractState.initialLoad) {
        dataToReturn = initialData
      } else {
        dataToReturn = useContractState.previousValue
      }
    }

    useContractState.initialLoad = false
    useContractState.previousValue = dataToReturn

    if (dataToReturn !== undefined && transformData) {
      dataToReturn = transformData(dataToReturn)
    }

    return [dataToReturn, error, isValidating, mutate]
  }
  return useContractState
}