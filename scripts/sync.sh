SOURCE_DIR="../mlvis-toolkit"
PACKAGES=("feature-list-view" "manifold" "mlvis-common" "mlvis-common-ui" "multi-way-plot" "segment-filters")

for i in ${PACKAGES[@]}
do
  rm -rf "./src/"$i
  mkdir "./src/"$i
  cp -r $SOURCE_DIR"/packages/"$i"/src/"* "./src/"$i
done

rm -rf "./examples/manfold/src"
mkdir "./examples/manfold/src"
cp -r $SOURCE_DIR"/examples/manifold/src/"* "./examples/manfold/src"