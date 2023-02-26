class ListDTO<T>  {

    metaData: {
        page: number;
        limit: number;
        totalDocuments: number;
    }[] = []; 
    data: T[] = []

}

export default ListDTO;