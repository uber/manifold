SOURCE_DIR="../mlvis-toolkit"
PACKAGES=("feature-list-view" "manifold" "mlvis-common" "multi-way-plot" "segment-filters")

for i in ${PACKAGES[@]}
do
  rm -rf "./src/"$i
  mkdir "./src/"$i
  cp -r $SOURCE_DIR"/packages/"$i"/src/"* "./src/"$i
done

rm -rf "./examples/manifold/src"
mkdir "./examples/manifold/src"
cp -r $SOURCE_DIR"/examples/manifold/src/"* "./examples/manifold/src"